window.HRD=window.HRD||{};
(function(){
 const number=v=>Number.isFinite(Number(v))?Number(v):null;
 const derbyText=node=>[node?.description,node?.eventName,node?.gameType,node?.seriesDescription,node?.officialDate,node?.status?.detailedState,node?.content?.summary].filter(Boolean).join(' ').toLowerCase();
 const candidateNames=node=>[node?.fullName,node?.displayName,node?.name,node?.person?.fullName,node?.player?.fullName,node?.athlete?.displayName,node?.batter?.fullName,node?.participant?.fullName].filter(Boolean);
 const average=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
 function isHomeRun(play,event){return /home run|homered|homer/i.test(String(event?.details?.description||event?.details?.event||play?.result?.event||play?.result?.description||''));}
 function hrValue(node){
  if(!node||typeof node!=='object')return null;
  const labels=[node.name,node.label,node.displayName,node.stat?.name,node.type,node.description].filter(Boolean).join(' ');
  for(const key of ['homeRuns','homeRunCount','homeruns','home_runs','hr','totalHomeRuns','score','value'])if(Object.hasOwn(node,key)){
   const n=number(node[key]);
   if(n!==null&&(key!=='score'&&key!=='value'||/home.?runs?|\bhr\b|derby/i.test(labels)))return n;
  }
  for(const collection of [node.stats,node.statistics,node.splits,node.results])if(Array.isArray(collection))for(const item of collection){
   const label=[item?.stat?.name,item?.name,item?.label,item?.displayName,item?.abbreviation,item?.type].filter(Boolean).join(' ');
   if(/home.?runs?|^hr$/i.test(label)){const n=number(item?.stat?.value??item?.value??item?.displayValue??item?.total);if(n!==null)return n;}
  }
  return null;
 }
 function extractSummaryScores(root){
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
 function extractPlayByPlay(feed){
  const totals=new Map(),metrics=new Map();
  const plays=feed?.liveData?.plays?.allPlays||[];
  for(const play of plays){
   const batter=play?.matchup?.batter?.fullName||play?.matchup?.batter?.name;
   const player=HRD.players.find(p=>HRD.norm(p.name)===HRD.norm(batter));
   if(!player)continue;
   const key=HRD.norm(player.name);
   if(!metrics.has(key))metrics.set(key,{distances:[],velocities:[],lastDistance:null,lastExitVelocity:null,lastDescription:''});
   const bucket=metrics.get(key);
   let playWasHomer=false;
   for(const event of play.playEvents||[]){
    const hit=event?.hitData;
    const homer=isHomeRun(play,event);
    if(homer)playWasHomer=true;
    if(!hit)continue;
    const distance=number(hit.totalDistance??hit.total_distance);
    const velocity=number(hit.launchSpeed??hit.exitVelocity??hit.exit_velocity);
    if(homer&&distance!==null){bucket.distances.push(distance);bucket.lastDistance=distance;}
    if(homer&&velocity!==null){bucket.velocities.push(velocity);bucket.lastExitVelocity=velocity;}
    if(homer)bucket.lastDescription=event?.details?.description||play?.result?.description||'';
   }
   if(!playWasHomer&&/home run|homered|homer/i.test(String(play?.result?.event||play?.result?.description||'')))playWasHomer=true;
   if(playWasHomer)totals.set(key,(totals.get(key)||0)+1);
  }
  return {totals,metrics};
 }
 function extractLiveContext(feed){
  const current=feed?.liveData?.plays?.currentPlay||{};
  const linescore=feed?.liveData?.linescore||{};
  const batter=current?.matchup?.batter?.fullName||current?.matchup?.batter?.name||'';
  const candidates=[
   current?.about?.remainingTime,current?.about?.timeRemaining,current?.count?.timeRemaining,
   linescore?.timeRemaining,feed?.gameData?.status?.timeRemaining
  ];
  const time=candidates.find(v=>v!==undefined&&v!==null&&String(v).trim()!=='');
  const outsCandidates=[current?.count?.outsRemaining,current?.about?.outsRemaining,linescore?.outsRemaining,linescore?.outs];
  const outs=outsCandidates.map(number).find(v=>v!==null);
  return {batter,time:time==null?'':String(time),outs};
 }
 async function getJson(url){const response=await fetch(`${url}${url.includes('?')?'&':'?'}_=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);return response.json();}
 function setTimer(ms){clearTimeout(HRD._timer);HRD._timer=setTimeout(HRD.refreshFromMlb,ms);}
 HRD.refreshFromMlb=async function(){
  const status=document.getElementById('apiStatus');
  if(status)status.innerHTML='<span class="live-dot"></span><span>Refreshing MLB live feed…</span>';
  try{
   const params=new URLSearchParams({sportId:'1',startDate:HRD.config.startDate,endDate:HRD.config.endDate,hydrate:'game(content(summary)),linescore,metadata'});
   const schedule=await getJson(`${HRD.config.schedule}?${params}`);
   const games=(schedule.dates||[]).flatMap(d=>d.games||[]);
   const derby=games.find(g=>/home run derby|homerun derby|derby/.test(derbyText(g)));
   const state=derby?.status?.abstractGameState||derby?.status?.codedGameState||'Preview';
   HRD.state.isLive=/live|in progress|i/i.test(String(state))||['I','M'].includes(String(derby?.status?.codedGameState));
   HRD.state.eventStatus=derby?.status?.detailedState||state||'Waiting for event';
   let payload=schedule,source='MLB StatsAPI schedule';
   if(derby?.gamePk){try{payload=await getJson(`${HRD.config.liveFeed}/${derby.gamePk}/feed/live`);source=`MLB live feed ${derby.gamePk}`;}catch(error){source=`MLB schedule (${derby.gamePk})`;}}
   const summaryScores=extractSummaryScores(payload);
   const playData=extractPlayByPlay(payload);
   const context=extractLiveContext(payload);
   HRD.state.currentHitter=context.batter;
   HRD.state.timeRemaining=context.time;
   HRD.state.outsRemaining=context.outs;
   const changed=[];
   let matched=0,metricMatches=0;
   HRD.players.forEach(player=>{
    const key=HRD.norm(player.name),old=player.hr;
    const playTotal=playData.totals.get(key),summaryTotal=summaryScores.get(key);
    const total=playTotal!==undefined?Math.max(playTotal,summaryTotal??0):summaryTotal;
    if(total!==undefined){player.hr=total;matched++;if(total>old)changed.push(player.name);}
    const bucket=playData.metrics.get(key);
    if(bucket&&(bucket.distances.length||bucket.velocities.length)){
     player.stats={...HRD.emptyStats(),...(player.stats||{}),maxDistance:bucket.distances.length?Math.max(...bucket.distances):player.stats?.maxDistance??null,avgDistance:average(bucket.distances),maxExitVelocity:bucket.velocities.length?Math.max(...bucket.velocities):player.stats?.maxExitVelocity??null,avgExitVelocity:average(bucket.velocities),bonusHomers:bucket.distances.filter(d=>d>=HRD.config.bonusDistance).length,trackedHomers:bucket.distances.length,lastDistance:bucket.lastDistance,lastExitVelocity:bucket.lastExitVelocity};
     if(bucket.lastDescription)HRD.state.lastPlay=`${player.name}: ${bucket.lastDescription}`;
     metricMatches++;
    }
   });
   const withDistance=HRD.players.filter(p=>p.stats?.maxDistance!=null).sort((a,b)=>b.stats.maxDistance-a.stats.maxDistance);
   const withVelo=HRD.players.filter(p=>p.stats?.maxExitVelocity!=null).sort((a,b)=>b.stats.maxExitVelocity-a.stats.maxExitVelocity);
   HRD.state.biggestHomer=withDistance[0]?{name:withDistance[0].name,owner:withDistance[0].owner,value:withDistance[0].stats.maxDistance}:null;
   HRD.state.hardestHit=withVelo[0]?{name:withVelo[0].name,owner:withVelo[0].owner,value:withVelo[0].stats.maxExitVelocity}:null;
   HRD.state.changedPlayers=changed;
   HRD.state.lastRefresh=new Date().toLocaleTimeString();HRD.state.source=source;HRD.persist();HRD.render();
   if(changed.length&&window.launchBall)changed.forEach((_,i)=>setTimeout(window.launchBall,i*250));
   const cadence=HRD.state.isLive?HRD.config.liveRefreshMs:HRD.config.idleRefreshMs;
   if(status)status.innerHTML=`<span class="live-dot ${HRD.state.isLive?'':'idle'}"></span><span>${HRD.state.isLive?'LIVE · ':''}${matched||metricMatches?`Updated ${matched}/8 totals and ${metricMatches}/8 Statcast profiles.`:'Connected. Waiting for MLB Derby scoring data.'} Next check in ${Math.round(cadence/1000)}s.</span>`;
   setTimer(cadence);
  }catch(error){
   if(status)status.innerHTML=`<span class="live-dot idle"></span><span>MLB refresh failed: ${error.message}. Retrying in 60s.</span>`;
   setTimer(HRD.config.idleRefreshMs);
  }
 };
 HRD.startAutoRefresh=function(){clearTimeout(HRD._timer);HRD.refreshFromMlb()};
})();