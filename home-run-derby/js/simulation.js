window.HRD=window.HRD||{};
(function(){
 const TRIALS=25000;
 const priors={'kyleschwarber':24.5,'juniorcaminero':23.5,'munetakamurakami':22.5,'jordanwalker':21.5,'jaccaglianone':23,'bryceharper':22,'benrice':21,'willsoncontreras':20.5};
 const randn=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 function strength(p){const prior=priors[HRD.norm(p.name)]||21,stats=p.stats||{},live=Math.max(0,Number(p.hr)||0),velo=stats.avgExitVelocity==null?0:clamp((stats.avgExitVelocity-100)*.35,-2,3),distance=stats.avgDistance==null?0:clamp((stats.avgDistance-400)*.08,-2,3),tracked=Math.max(0,Number(stats.trackedHomers)||0),weight=HRD.state.isLive?clamp(tracked/15,.15,.75):0;return prior*(1-weight)+(live+Math.max(4,prior*.42))*weight+velo+distance;}
 function roundScore(p,roundFactor=1){const mean=strength(p)*roundFactor,volatility=Math.max(3.8,mean*.22);return Math.max(0,Math.round(mean+randn()*volatility));}
 function winner(a,b,roundFactor){const as=roundScore(a,roundFactor),bs=roundScore(b,roundFactor);if(as===bs)return Math.random()<.5?a:b;return as>bs?a:b;}
 HRD.runSimulation=function(){
  const players=HRD.players.map(p=>({...p})),results=new Map(players.map(p=>[p.name,{semi:0,final:0,win:0,total:0}]));
  for(let t=0;t<TRIALS;t++){
   const opening=players.map(p=>({p,score:roundScore(p,1)})).sort((a,b)=>b.score-a.score||Math.random()-.5),semifinalists=opening.slice(0,4).map(x=>x.p);
   semifinalists.forEach(p=>results.get(p.name).semi++);
   const f1=winner(semifinalists[0],semifinalists[3],.82),f2=winner(semifinalists[1],semifinalists[2],.82);
   results.get(f1.name).final++;results.get(f2.name).final++;
   const champ=winner(f1,f2,.72);results.get(champ.name).win++;
   opening.forEach(x=>results.get(x.p.name).total+=x.score);
  }
  HRD.projections=players.map(p=>{const r=results.get(p.name);return {name:p.name,owner:p.owner,semi:r.semi/TRIALS,final:r.final/TRIALS,win:r.win/TRIALS,expected:r.total/TRIALS};}).sort((a,b)=>b.win-a.win);
  return HRD.projections;
 };
 function saveSnapshot(rows){
  const now=Date.now(),last=HRD.state.oddsHistory.at(-1);
  if(last&&now-last.time<10000)return;
  HRD.state.oddsHistory.push({time:now,values:Object.fromEntries(rows.map(r=>[r.owner,r.win]))});
  if(HRD.state.oddsHistory.length>30)HRD.state.oddsHistory.shift();
 }
 function chart(rows){
  const history=HRD.state.oddsHistory||[];
  if(history.length<2)return '<div class="chart-empty">Odds history begins after the next MLB refresh.</div>';
  const width=600,height=180,pad=24,max=Math.max(.3,...history.flatMap(h=>Object.values(h.values))),x=i=>pad+i*(width-pad*2)/Math.max(1,history.length-1),y=v=>height-pad-v*(height-pad*2)/max;
  const top=rows.slice(0,4),paths=top.map((r,index)=>{const points=history.map((h,i)=>`${x(i)},${y(h.values[r.owner]||0)}`).join(' ');return `<polyline points="${points}" fill="none" stroke="var(--chart${index+1})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;}).join('');
  const labels=top.map((r,index)=>`<span><i style="background:var(--chart${index+1})"></i>${r.owner}</span>`).join('');
  return `<div class="odds-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Live win probability history"><line x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}" stroke="#ffffff25"/>${paths}</svg><div class="chart-legend">${labels}</div></div>`;
 }
 HRD.renderSimulation=function(){
  const root=document.getElementById('simulation');if(!root)return;
  const rows=HRD.runSimulation();saveSnapshot(rows);
  root.innerHTML=`<div class="sim-note">25,000 simulations · MLB totals and Statcast metrics</div><div class="sim-head"><span>Owner</span><span>SF</span><span>Final</span><span>Win</span></div>${rows.map((r,i)=>`<div class="sim-row"><span><strong>${i+1}. ${r.owner}</strong><small>${r.name}</small></span><span>${(r.semi*100).toFixed(1)}%</span><span>${(r.final*100).toFixed(1)}%</span><span class="win-pct">${(r.win*100).toFixed(1)}%</span></div>`).join('')}<h3 class="chart-title">Live win probability</h3>${chart(rows)}`;
 };
})();