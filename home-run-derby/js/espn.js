window.HRD=window.HRD||{};
(function(){
 const numeric=v=>Number.isFinite(Number(v))?Number(v):null;
 function eventText(e){return [e.name,e.shortName,e.season?.slug,e.competitions?.[0]?.notes?.map(n=>n.headline).join(' ')].filter(Boolean).join(' ').toLowerCase()}
 function namesIn(node){return [node?.displayName,node?.fullName,node?.name,node?.athlete?.displayName,node?.athlete?.fullName,node?.competitor?.displayName].filter(Boolean)}
 function hrValue(node){
  const direct=['homeRuns','homeruns','home_runs','hr','score','value'];
  for(const key of direct){if(node&&Object.hasOwn(node,key)){const n=numeric(node[key]);if(n!==null&&(/home.?run|\bhr\b/i.test(String(node.name||node.label||node.displayName||key))||key==='homeRuns'||key==='homeruns'||key==='home_runs'))return n}}
  const stats=node?.statistics||node?.stats;
  if(Array.isArray(stats))for(const s of stats){if(/home.?runs?|^hr$/i.test(String(s.name||s.label||s.displayName||s.abbreviation||''))){const n=numeric(s.value??s.displayValue);if(n!==null)return n}}
  return null;
 }
 function extract(root){
  const found=new Map(),seen=new Set();
  function walk(node){
   if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);
   for(const candidate of namesIn(node)){
    const p=HRD.players.find(x=>HRD.norm(x.name)===HRD.norm(candidate));
    if(p){const n=hrValue(node);if(n!==null)found.set(HRD.norm(p.name),Math.max(found.get(HRD.norm(p.name))??0,n))}
   }
   if(Array.isArray(node))node.forEach(walk);else Object.values(node).forEach(walk);
  }
  walk(root);return found;
 }
 HRD.refreshFromEspn=async function(){
  const status=document.getElementById('apiStatus');
  if(status)status.textContent='Refreshing ESPN…';
  try{
   const board=await fetch(`${HRD.config.scoreboard}?dates=${HRD.config.dates}&limit=100&_=${Date.now()}`,{cache:'no-store'});
   if(!board.ok)throw new Error(`scoreboard ${board.status}`);
   const boardData=await board.json();
   const event=(boardData.events||[]).find(e=>/home run derby|homerun derby|derby/.test(eventText(e)));
   let payload=boardData,source='ESPN scoreboard';
   if(event?.id){const summary=await fetch(`${HRD.config.summary}?event=${encodeURIComponent(event.id)}&_=${Date.now()}`,{cache:'no-store'});if(summary.ok){payload=await summary.json();source=`ESPN event ${event.id}`}}
   const scores=extract(payload);
   let matched=0;
   HRD.players.forEach(p=>{const n=scores.get(HRD.norm(p.name));if(n!==undefined){p.hr=n;matched++}});
   HRD.state.lastRefresh=new Date().toLocaleString();HRD.state.source=source;HRD.persist();HRD.render();
   if(status)status.textContent=matched?`ESPN updated ${matched}/8 hitters.`:`ESPN connected, but no Derby totals were published yet. Manual scores remain available.`;
  }catch(err){if(status)status.textContent=`ESPN refresh failed: ${err.message}. Manual scores were kept.`}
 };
 HRD.startAutoRefresh=function(){clearInterval(HRD._timer);HRD._timer=setInterval(HRD.refreshFromEspn,HRD.config.refreshMs)};
})();