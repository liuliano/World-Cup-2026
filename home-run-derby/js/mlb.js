window.HRD=window.HRD||{};
(function(){
 const number=v=>Number.isFinite(Number(v))?Number(v):null;
 const text=v=>String(v||'').toLowerCase();
 const derbyText=node=>[node?.description,node?.eventName,node?.gameType,node?.seriesDescription,node?.officialDate,node?.status?.detailedState,node?.content?.summary].filter(Boolean).join(' ').toLowerCase();
 const candidateNames=node=>[
  node?.fullName,node?.displayName,node?.name,node?.person?.fullName,node?.player?.fullName,
  node?.athlete?.displayName,node?.batter?.fullName,node?.participant?.fullName
 ].filter(Boolean);
 function hrValue(node){
  if(!node||typeof node!=='object')return null;
  const labels=[node.name,node.label,node.displayName,node.stat?.name,node.type,node.description].filter(Boolean).join(' ');
  const keys=['homeRuns','homeRunCount','homeruns','home_runs','hr','totalHomeRuns','score','value'];
  for(const key of keys){
   if(Object.hasOwn(node,key)){
    const n=number(node[key]);
    if(n!==null&&(key!=='score'&&key!=='value'||/home.?runs?|\bhr\b|derby/i.test(labels)))return n;
   }
  }
  for(const collection of [node.stats,node.statistics,node.splits,node.results]){
   if(Array.isArray(collection))for(const item of collection){
    const label=[item?.stat?.name,item?.name,item?.label,item?.displayName,item?.abbreviation,item?.type].filter(Boolean).join(' ');
    if(/home.?runs?|^hr$/i.test(label)){
     const n=number(item?.stat?.value??item?.value??item?.displayValue??item?.total);
     if(n!==null)return n;
    }
   }
  }
  return null;
 }
 function extract(root){
  const found=new Map(),seen=new Set();
  function walk(node){
   if(!node||typeof node!=='object'||seen.has(node))return;
   seen.add(node);
   for(const name of candidateNames(node)){
    const player=HRD.players.find(p=>HRD.norm(p.name)===HRD.norm(name));
    if(player){
     const n=hrValue(node);
     if(n!==null)found.set(HRD.norm(player.name),Math.max(found.get(HRD.norm(player.name))??0,n));
    }
   }
   if(Array.isArray(node))node.forEach(walk);else Object.values(node).forEach(walk);
  }
  walk(root);
  return found;
 }
 async function getJson(url){
  const response=await fetch(`${url}${url.includes('?')?'&':'?'}_=${Date.now()}`,{cache:'no-store'});
  if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
 }
 HRD.refreshFromMlb=async function(){
  const status=document.getElementById('apiStatus');
  if(status)status.textContent='Refreshing MLB StatsAPI…';
  try{
   const params=new URLSearchParams({sportId:'1',startDate:HRD.config.startDate,endDate:HRD.config.endDate,hydrate:'game(content(summary)),linescore,metadata'});
   const schedule=await getJson(`${HRD.config.schedule}?${params}`);
   const games=(schedule.dates||[]).flatMap(d=>d.games||[]);
   const derby=games.find(g=>/home run derby|homerun derby|derby/.test(derbyText(g)));
   let payload=schedule;
   let source='MLB StatsAPI schedule';
   if(derby?.gamePk){
    try{
     payload=await getJson(`${HRD.config.liveFeed}/${derby.gamePk}/feed/live`);
     source=`MLB StatsAPI game ${derby.gamePk}`;
    }catch(error){
     source=`MLB StatsAPI schedule (${derby.gamePk})`;
    }
   }
   const scores=extract(payload);
   let matched=0;
   HRD.players.forEach(player=>{
    const score=scores.get(HRD.norm(player.name));
    if(score!==undefined){player.hr=score;matched++;}
   });
   HRD.state.lastRefresh=new Date().toLocaleString();
   HRD.state.source=source;
   HRD.persist();
   HRD.render();
   if(status)status.textContent=matched
    ?`MLB StatsAPI updated ${matched}/8 hitters.`
    :`MLB StatsAPI connected, but Derby hitter totals are not published yet. Manual totals were kept.`;
  }catch(error){
   if(status)status.textContent=`MLB StatsAPI refresh failed: ${error.message}. Manual totals were kept.`;
  }
 };
 HRD.startAutoRefresh=function(){
  clearInterval(HRD._timer);
  HRD._timer=setInterval(HRD.refreshFromMlb,HRD.config.refreshMs);
 };
})();