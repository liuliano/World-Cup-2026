window.HRD=window.HRD||{};
(function(){
 const TRIALS=50000;
 const priorMeans={'kyleschwarber':24.5,'juniorcaminero':23.5,'munetakamurakami':22.5,'jordanwalker':21.5,'jaccaglianone':23,'bryceharper':22,'benrice':21,'willsoncontreras':20.5};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const randn=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
 function gamma(shape){
  if(shape<1)return gamma(shape+1)*Math.pow(Math.random(),1/shape);
  const d=shape-1/3,c=1/Math.sqrt(9*d);
  while(true){const x=randn(),v=Math.pow(1+c*x,3);if(v<=0)continue;const u=Math.random();if(u<1-.0331*x*x*x*x||Math.log(u)<.5*x*x+d*(1-v+Math.log(v)))return d*v;}
 }
 function posterior(p){
  const prior=priorMeans[HRD.norm(p.name)]||21;
  const s=p.stats||{},tracked=Math.max(0,Number(s.trackedHomers)||0),live=Math.max(0,Number(p.hr)||0);
  const evidence=Math.max(tracked,live);
  const statcastBoost=(s.avgExitVelocity==null?0:clamp((s.avgExitVelocity-101)*.25,-1.5,2.5))+(s.avgDistance==null?0:clamp((s.avgDistance-400)*.055,-1.5,2.5));
  const adjustedPrior=Math.max(8,prior+statcastBoost);
  const priorWeight=12;
  const livePace=evidence?Math.max(live,tracked)+Math.max(5,adjustedPrior*.38):adjustedPrior;
  const liveWeight=HRD.state.isLive?clamp(evidence,0,24):0;
  const mean=(adjustedPrior*priorWeight+livePace*liveWeight)/(priorWeight+liveWeight);
  const concentration=priorWeight+liveWeight;
  return {mean,shape:Math.max(2,concentration),scale:mean/Math.max(2,concentration),evidence};
 }
 function sampledScore(p,factor=1){const post=posterior(p),rate=gamma(post.shape)*post.scale*factor;return Math.max(0,Math.round(rate+randn()*Math.max(1.4,Math.sqrt(rate)*.55)));}
 function winner(a,b,factor){const as=sampledScore(a,factor),bs=sampledScore(b,factor);return as===bs?(Math.random()<.5?a:b):(as>bs?a:b);}
 HRD.runSimulation=function(){
  const players=HRD.players.map(p=>({...p})),results=new Map(players.map(p=>[p.name,{semi:0,final:0,win:0,total:0}]));
  for(let t=0;t<TRIALS;t++){
   const opening=players.map(p=>({p,score:sampledScore(p,1)})).sort((a,b)=>b.score-a.score||Math.random()-.5),semi=opening.slice(0,4).map(x=>x.p);
   semi.forEach(p=>results.get(p.name).semi++);
   const f1=winner(semi[0],semi[3],.82),f2=winner(semi[1],semi[2],.82);
   results.get(f1.name).final++;results.get(f2.name).final++;
   const champ=winner(f1,f2,.72);results.get(champ.name).win++;
   opening.forEach(x=>results.get(x.p.name).total+=x.score);
  }
  HRD.projections=players.map(p=>{const r=results.get(p.name),post=posterior(p);return {name:p.name,owner:p.owner,semi:r.semi/TRIALS,final:r.final/TRIALS,win:r.win/TRIALS,expected:r.total/TRIALS,posteriorMean:post.mean,evidence:post.evidence};}).sort((a,b)=>b.win-a.win);
  return HRD.projections;
 };
 function saveSnapshot(rows){const now=Date.now(),last=HRD.state.oddsHistory.at(-1);if(last&&now-last.time<10000)return;HRD.state.oddsHistory.push({time:now,values:Object.fromEntries(rows.map(r=>[r.owner,r.win]))});if(HRD.state.oddsHistory.length>30)HRD.state.oddsHistory.shift();}
 function chart(rows){
  const history=HRD.state.oddsHistory||[];if(history.length<2)return '<div class="chart-empty">Odds history begins after the next MLB refresh.</div>';
  const width=600,height=180,pad=24,max=Math.max(.3,...history.flatMap(h=>Object.values(h.values))),x=i=>pad+i*(width-pad*2)/Math.max(1,history.length-1),y=v=>height-pad-v*(height-pad*2)/max;
  const top=rows.slice(0,4),paths=top.map((r,index)=>`<polyline points="${history.map((h,i)=>`${x(i)},${y(h.values[r.owner]||0)}`).join(' ')}" fill="none" stroke="var(--chart${index+1})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const labels=top.map((r,index)=>`<span><i style="background:var(--chart${index+1})"></i>${r.owner}</span>`).join('');
  return `<div class="odds-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Live win probability history"><line x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}" stroke="#ffffff25"/>${paths}</svg><div class="chart-legend">${labels}</div></div>`;
 }
 HRD.renderSimulation=function(){
  const root=document.getElementById('simulation');if(!root)return;const rows=HRD.runSimulation();saveSnapshot(rows);
  root.innerHTML=`<div class="sim-note">50,000 Bayesian Monte Carlo simulations · priors update with official MLB totals and Statcast evidence</div><div class="sim-head"><span>Owner</span><span>SF</span><span>Final</span><span>Win</span></div>${rows.map((r,i)=>`<div class="sim-row"><span><strong>${i+1}. ${r.owner}</strong><small>${r.name}</small></span><span>${(r.semi*100).toFixed(1)}%</span><span>${(r.final*100).toFixed(1)}%</span><span class="win-pct">${(r.win*100).toFixed(1)}%</span></div>`).join('')}<h3 class="chart-title">Live win probability</h3>${chart(rows)}`;
 };
})();