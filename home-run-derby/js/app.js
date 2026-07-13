window.HRD=window.HRD||{};
(function(){
 const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
 const liveSorted=()=>[...HRD.players].sort((a,b)=>b.hr-a.hr||a.name.localeCompare(b.name));
 const fmt=(value,digits=0)=>value==null?'—':Number(value).toFixed(digits);
 const slot=(p,seed)=>`<div class="slot"><span><span class="seed">#${seed}</span> ${p?p.name:'TBD'}<br><span class="owner">${p&&p.owner?p.owner:'Unassigned'}</span></span><strong>${p?p.hr:0}</strong></div>`;
 const statLine=(label,value)=>`<div class="stat-line"><span>${label}</span><strong>${value}</strong></div>`;
 function playerStats(p){const s=p.stats||HRD.emptyStats();return `<div class="stat-grid">${statLine('Max distance',s.maxDistance==null?'—':`${fmt(s.maxDistance)} ft`)}${statLine('Avg distance',s.avgDistance==null?'—':`${fmt(s.avgDistance)} ft`)}${statLine('Max exit velo',s.maxExitVelocity==null?'—':`${fmt(s.maxExitVelocity,1)} mph`)}${statLine('Avg exit velo',s.avgExitVelocity==null?'—':`${fmt(s.avgExitVelocity,1)} mph`)}${statLine(`Bonus HRs (${HRD.config.bonusDistance}+ ft)`,s.bonusHomers||0)}${statLine('Tracked HRs',s.trackedHomers||0)}${statLine('Last distance',s.lastDistance==null?'—':`${fmt(s.lastDistance)} ft`)}${statLine('Last exit velo',s.lastExitVelocity==null?'—':`${fmt(s.lastExitVelocity,1)} mph`)}</div>`}
 function moveOddsToTop(){const simulation=document.getElementById('simulation'),hero=document.querySelector('.hero'),card=simulation?.closest('.card');if(card&&hero&&hero.nextElementSibling!==card)hero.insertAdjacentElement('afterend',card)}
 const scoringStarted=()=>HRD.players.some(p=>(Number(p.hr)||0)>0);
 function projectedOrder(fallback){
  const byName=new Map(HRD.players.map(p=>[p.name,p]));
  const projected=(HRD.projections||[]).map(r=>byName.get(r.name)).filter(Boolean);
  return projected.length===HRD.players.length?projected:fallback;
 }
 function renderSticky(leader,isProjected){
  const root=document.getElementById('stickyLive');if(!root)return;
  const detail=[HRD.state.currentHitter&&`Hitting: ${HRD.state.currentHitter}`,HRD.state.timeRemaining&&`Time: ${HRD.state.timeRemaining}`,HRD.state.outsRemaining!=null&&`Outs: ${HRD.state.outsRemaining}`].filter(Boolean).join(' · ');
  const projection=(HRD.projections||[]).find(r=>r.name===leader?.name);
  const leaderText=!leader?'Waiting':isProjected?`${leader.owner} · ${(projection?.win*100||0).toFixed(1)}% win`:`${leader.owner} · ${leader.hr} HR`;
  root.innerHTML=`<span class="live-dot ${HRD.state.isLive?'':'idle'}"></span><div><strong>${HRD.state.isLive?'LIVE':'MLB'}</strong><small>${detail||HRD.state.eventStatus}</small></div><div class="sticky-leader"><small>${isProjected?'Projected leader':'Leader'}</small><strong>${leaderText}</strong></div>`
 }
 function renderHighlights(){const root=document.getElementById('highlights');if(!root)return;const long=HRD.state.biggestHomer,hard=HRD.state.hardestHit;root.innerHTML=`<div class="highlight"><span>🚀 Biggest homer</span><strong>${long?`${fmt(long.value)} ft`:'—'}</strong><small>${long?`${long.owner} · ${long.name}`:'Waiting for MLB Statcast'}</small></div><div class="highlight"><span>🔥 Hardest hit</span><strong>${hard?`${fmt(hard.value,1)} mph`:'—'}</strong><small>${hard?`${hard.owner} · ${hard.name}`:'Waiting for MLB Statcast'}</small></div><div class="highlight"><span>⏱ Current hitter</span><strong>${HRD.state.currentHitter||'—'}</strong><small>${[HRD.state.timeRemaining&&`${HRD.state.timeRemaining} remaining`,HRD.state.outsRemaining!=null&&`${HRD.state.outsRemaining} outs`].filter(Boolean).join(' · ')||'Shown when MLB publishes it'}</small></div>`}
 HRD.render=function(){
  const live=liveSorted(),changed=new Set(HRD.state.changedPlayers||[]);
  if(HRD.renderSimulation)HRD.renderSimulation();
  const isProjected=!scoringStarted();
  const display=isProjected?projectedOrder(live):live;
  document.getElementById('leaderboard').innerHTML=`<div class="sim-note">${isProjected?'Ranked by Monte Carlo win probability before scoring.':'Ranked by live MLB home-run totals.'}</div>`+display.map((p,i)=>`<div class="player-card ${i===0?'leader':''} ${changed.has(p.name)?'just-scored':''}"><div class="player"><div class="rank">${i+1}</div><div><div class="name">${p.name}</div><div class="owner">Owner: ${p.owner}</div></div><div class="score">${p.hr}<small>HOME RUNS</small></div></div>${playerStats(p)}</div>`).join('');
  const adv=display.slice(0,4),m1=[adv[0],adv[3]],m2=[adv[1],adv[2]];
  document.getElementById('bracket').innerHTML=`<div class="sim-note">Seeds follow ${isProjected?'Monte Carlo odds before scoring':'live MLB totals'}.</div><div class="match"><div class="match-title">Semifinal 1</div>${slot(m1[0],1)}${slot(m1[1],4)}</div><div class="match"><div class="match-title">Semifinal 2</div>${slot(m2[0],2)}${slot(m2[1],3)}</div><div class="match"><div class="match-title">Final</div><div class="slot"><span class="winner">Winner SF1</span><span>vs</span></div><div class="slot"><span class="winner">Winner SF2</span><span>TBD</span></div></div>`;
  const total=HRD.players.reduce((n,p)=>n+p.hr,0);
  document.getElementById('status').innerHTML=`<div class="player"><div class="rank">${total}</div><div><div class="name">${HRD.state.isLive?'🔴 LIVE · ':''}${HRD.state.eventStatus}</div><div class="owner">Official source: ${HRD.state.source}</div></div><div class="score">${display[0]?.hr||0}<small>${isProjected?'PROJECTED #1':'LEADER'}</small></div></div>${HRD.state.lastPlay?`<div class="last-play">Last recorded homer: ${esc(HRD.state.lastPlay)}</div>`:''}${HRD.state.lastRefresh?`<div class="sub">Last MLB update: ${HRD.state.lastRefresh}</div>`:''}`;
  renderSticky(display[0],isProjected);renderHighlights();
  if(changed.size)setTimeout(()=>{HRD.state.changedPlayers=[];document.querySelectorAll('.just-scored').forEach(el=>el.classList.remove('just-scored'))},3500)
 };
 window.launchBall=function(){const ball=document.createElement('div');ball.className='flying-ball';ball.textContent='⚾';document.body.appendChild(ball);setTimeout(()=>ball.remove(),1400)};
 window.shareApp=async function(){try{await navigator.share({title:'HR Dinger Pool 2026',url:location.href})}catch(e){await navigator.clipboard.writeText(location.href);alert('Link copied')}};
 window.refreshFromMlb=()=>HRD.refreshFromMlb();
 moveOddsToTop();HRD.render();HRD.startAutoRefresh();
})();