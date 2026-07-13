window.HRD=window.HRD||{};
(function(){
 const number=v=>Number.isFinite(Number(v))?Number(v):null;
 const derbyText=node=>[node?.description,node?.eventName,node?.gameType,node?.seriesDescription,node?.officialDate,node?.status?.detailedState,node?.content?.summary].filter(Boolean).join(' ').toLowerCase();
 const candidateNames=node=>[node?.fullName,node?.displayName,node?.name,node?.person?.fullName,node?.player?.fullName,node?.athlete?.displayName,node?.batter?.fullName,node?.participant?.fullName].filter(Boolean);
 function hrValue(node){
  if(!node||typeof node!=='object')return null;
  const labels=[node.name,node.label,node.displayName,node.stat?.name,node.type,node.description].filter(Boolean).join(' ');
  const keys=['homeRuns','homeRunCount','homeruns','home_runs','hr','totalHomeRuns','score','value'];
  for(const key of keys)if(Object.hasOwn(node,key)){
   const n=number(node[key]);
   if(n!==null&&(key!=='score'&&key!=='value'||/home.?runs?|\bhr\b|derby/i.test(labels)))return n;
  }
  for(const collection of [node.stats,node.statistics,node.splits,node.results])if(Array.isArray(collection))for(const item of collection){
   const label=[item?.stat?.name,item?.name,item?.label,item?.displayName,item?.abbreviation,item?.type].filter(Boolean).join(' ');
   if(/home.?runs?|^hr$/i.test(label)){
    const n=number(item?.stat?.value??item?.value??item?.displayValue??item?.total);
    if(n!==null)return n;
   }
  }
  return null;
 }
 function extractScores(root){
  const found=new Map(),seen=new Set();
  function walk(node){
   if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);
   for(const name of candidateNames(node)){
    const player=HRD.players.find(p=>HRD.norm(p.name)===HRD.norm(name));
    if(player){const n=hrValue(node);if(n!==null)found.set(HRD.norm(player.name),Math.max(found.get(HRD.norm(player.name))??0,n));}
   }
   if(Array.isArray(node))node.forEach(walk);else Object.values(node).forEach(walk);
  }
  walk(root);return found;
 }
 function extractHitMetrics(feed){
  const metrics=new Map();
  const plays=feed?.liveData?.plays?.allPlays||[];
  for(const play of plays){
   const batter=play?.matchup?.batter?.fullName||play?.matchup?.batter?.name;
   const player=HRD.players.find(p=>HRD.norm(p.name)===HRD.norm(batter));
   if(!player)continue;
   const key=HRD.norm(player.name);
   if(!metrics.has(key))metrics.set(key,{distances:[],velocities:[]});
   const bucket=metrics.get(key);
   for(const event of play.playEvents||[]){
    const hit=event?.hitData;
    if(!hit)continue;
    const distance=number(hit.totalDistance??hit.total_distance);
    const velocity=number(hit.launchSpeed??hit.exitVelocity??hit.exit_velocity);
    const isHomer=/home run|homered|homer/i.test(String(event?.details?.description||play?.result?.event||play?.result?.description||''));
    if(distance!==null&&(isHomer||distance>=250))bucket.distances.push(distance);
    if(velocity!==null&&(isHomer||distance!==null))bucket.velocities.push(velocity);
   }
  }
  return metrics;
 }
 const average=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
 async function getJson(url){
  const response=await fetch(`${url}${url.includes('?')?'&':'?'}_=${Date.now()}`,{cache:'no-store'});
  if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
 }
 HRD.refreshFromMlb=async function(){
  const status=document.getElementById('apiStatus');
  if(status)status.innerHTML='<span class="live-dot"></span><span>Refreshing MLB StatsAPI…</span>';
  try{
   const params=new URLSearchParams({sportId:'1',startDate:HRD.config.startDate,endDate:HRD.config.endDate,hydrate:'game(content(summary)),linescore,metadata'});
   const schedule=await getJson(`${HRD.config.schedule}?${params}`);
   const games=(schedule.dates||[]).flatMap(d=>d.games||[]);
   const derby=games.find(g=>/home run derby|homerun derby|derby/.test(derbyText(g)));
   let payload=schedule,source='MLB StatsAPI schedule';
   if(derby?.gamePk){
    try{payload=await getJson(`${HRD.config.liveFeed}/${derby.gamePk}/feed/live`);source=`MLB StatsAPI game ${derby.gamePk}`;}
    catch(error){source=`MLB StatsAPI schedule (${derby.gamePk})`;}
   }
   const scores=extractScores(payload),metrics=extractHitMetrics(payload);
   let matched=0,metricMatches=0;
   HRD.players.forEach(player=>{
    const key=HRD.norm(player.name),score=scores.get(key),bucket=metrics.get(key);
    if(score!==undefined){player.hr=score;matched++;}
    if(bucket&&(bucket.distances.length||bucket.velocities.length)){
     player.stats={
      maxDistance:bucket.distances.length?Math.max(...bucket.distances):null,
      avgDistance:average(bucket.distances),
      maxExitVelocity:bucket.velocities.length?Math.max(...bucket.velocities):null,
      avgExitVelocity:average(bucket.velocities),
      bonusHomers:bucket.distances.filter(distance=>distance>=HRD.config.bonusDistance).length,
      trackedHomers:bucket.distances.length
     };
     metricMatches++;
    }
   });
   HRD.state.lastRefresh=new Date().toLocaleString();HRD.state.source=source;HRD.persist();HRD.render();
   if(status)status.innerHTML=`<span class="live-dot"></span><span>${matched||metricMatches?`MLB updated ${matched}/8 totals and advanced stats for ${metricMatches}/8 hitters.`:'MLB connected, but Derby totals and Statcast metrics are not published yet. Manual totals were kept.'}</span>`;
  }catch(error){if(status)status.innerHTML=`<span class="live-dot"></span><span>MLB StatsAPI refresh failed: ${error.message}. Saved totals were kept.</span>`;}
 };
 HRD.startAutoRefresh=function(){clearInterval(HRD._timer);HRD._timer=setInterval(HRD.refreshFromMlb,HRD.config.refreshMs)};
})();