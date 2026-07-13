window.HRD=window.HRD||{};
(function(){
 const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
 const sorted=()=>[...HRD.players].sort((a,b)=>b.hr-a.hr||a.name.localeCompare(b.name));
 const fmt=(value,digits=0)=>value==null?'—':Number(value).toFixed(digits);
 const slot=(p,seed)=>`<div class="slot"><span><span class="seed">#${seed}</span> ${p?p.name:'TBD'}<br><span class="owner">${p&&p.owner?p.owner:'Unassigned'}</span></span><strong>${p?p.hr:0}</strong></div>`;
 const statLine=(label,value)=>`<div class="stat-line"><span>${label}</span><strong>${value}</strong></div>`;
 function playerStats(p){const s=p.stats||HRD.emptyStats();return `<div class="stat-grid">${statLine('Max distance',s.maxDistance==null?'—':`${fmt(s.maxDistance)} ft`)}${statLine('Avg distance',s.avgDistance==null?'—':`${fmt(s.avgDistance)} ft`)}${statLine('Max exit velo',s.maxExitVelocity==null?'—':`${fmt(s.maxExitVelocity,1)} mph`)}${statLine('Avg exit velo',s.avgExitVelocity==null?'—':`${fmt(s.avgExitVelocity,1)} mph`)}${statLine(`Bonus HRs (${HRD.config.bonusDistance}+ ft)`,s.bonusHomers||0)}${statLine('Tracked HRs',s.trackedHomers||0)}${statLine('Last distance',s.lastDistance==null?'—':`${fmt(s.lastDistance)} ft`)}${statLine('Last exit velo',s.lastExitVelocity==null?'—':`${fmt(s.lastExitVelocity,1)} mph`)}</div>`}
 HRD.renderEditor=function(){document.getElementById('editor').innerHTML=HRD.players.map((p,i)=>`<div class="row"><input id="n${i}" value="${esc(p.name)}"><input id="h${i}" type="number" min="0" value="${p.hr}"></div><div class="row"><input id="o${i}" value="${esc(p.owner)}" placeholder="Pool owner"><span></span></div>`).join('')};
 HRD.render=function(){
  const s=sorted(),changed=new Set(HRD.state.changedPlayers||[]);
  document.getElementById('leaderboard').innerHTML=s.map((p,i)=>`<div class="player-card ${i===0?'leader':''} ${changed.has(p.name)?'just-scored':''}"><div class="player"><div class="rank">${i+1}</div><div><div class="name">${p.name}</div><div class="owner">${p.owner?'Owner: '+p.owner:'Owner not assigned'}</div></div><div class="score">${p.hr}<small>HOME RUNS</small></div></div>${playerStats(p)}</div>`).join('');
  const adv=s.slice(0,4),m1=[adv[0],adv[3]],m2=[adv[1],adv[2]];
  document.getElementById('bracket').innerHTML=`<div class="match"><div class="match-title">Semifinal 1</div>${slot(m1[0],1)}${slot(m1[1],4)}</div><div class="match"><div class="match-title">Semifinal 2</div>${slot(m2[0],2)}${slot(m2[1],3)}</div><div class="match"><div class="match-title">Final</div><div class="slot"><span class="winner">Winner SF1</span><span>vs</span></div><div class="slot"><span class="winner">Winner SF2</span><span>TBD</span></div></div>`;
  const total=HRD.players.reduce((n,p)=>n+p.hr,0),assigned=HRD.players.filter(p=>p.owner.trim()).length;
  document.getElementById('status').innerHTML=`<div class="player"><div class="rank">${total}</div><div><div class="name">${HRD.state.isLive?'🔴 LIVE · ':''}${HRD.state.eventStatus}</div><div class="owner">${assigned}/8 owners assigned · ${HRD.state.source}</div></div><div class="score">${s[0]?.hr||0}<small>LEADER</small></div></div>${HRD.state.lastPlay?`<div class="last-play">Last recorded homer: ${esc(HRD.state.lastPlay)}</div>`:''}${HRD.state.lastRefresh?`<div class="sub">Last MLB update: ${HRD.state.lastRefresh}</div>`:''}`;
  HRD.renderEditor();if(HRD.renderSimulation)HRD.renderSimulation();
  if(changed.size)setTimeout(()=>{HRD.state.changedPlayers=[];document.querySelectorAll('.just-scored').forEach(el=>el.classList.remove('just-scored'))},3500);
 };
 window.launchBall=function(){const ball=document.createElement('div');ball.className='flying-ball';ball.textContent='⚾';document.body.appendChild(ball);setTimeout(()=>ball.remove(),1400)};
 window.saveEdits=function(){HRD.players=HRD.players.map((p,i)=>({...p,name:document.getElementById('n'+i).value.trim()||p.name,owner:document.getElementById('o'+i).value.trim(),hr:Math.max(0,Number(document.getElementById('h'+i).value)||0),stats:{...HRD.emptyStats(),...(p.stats||{})}}));HRD.state.source='Manual';HRD.persist();HRD.render();document.getElementById('admin').classList.add('hidden')};
 window.toggleAdmin=function(){document.getElementById('admin').classList.toggle('hidden');HRD.renderEditor()};
 window.restoreDefaults=function(){if(confirm('Restore the original eight players and clear owners, scores and stats?')){HRD.players=structuredClone(HRD.defaults);HRD.state.source='Manual';HRD.persist();HRD.render()}};
 window.shareApp=async function(){try{await navigator.share({title:'HR Dinger Pool 2026',url:location.href})}catch(e){await navigator.clipboard.writeText(location.href);alert('Link copied')}};
 window.refreshFromMlb=()=>HRD.refreshFromMlb();
 HRD.render();HRD.startAutoRefresh();
})();