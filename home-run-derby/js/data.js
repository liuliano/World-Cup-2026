window.HRD=window.HRD||{};
HRD.emptyStats=()=>({maxDistance:null,avgDistance:null,maxExitVelocity:null,avgExitVelocity:null,bonusHomers:0,trackedHomers:0,lastDistance:null,lastExitVelocity:null});
HRD.defaults=[
 {name:'Kyle Schwarber',owner:'',hr:0},{name:'Junior Caminero',owner:'',hr:0},{name:'Munetaka Murakami',owner:'',hr:0},{name:'Jordan Walker',owner:'',hr:0},
 {name:'Jac Caglianone',owner:'',hr:0},{name:'Bryce Harper',owner:'',hr:0},{name:'Ben Rice',owner:'',hr:0},{name:'Willson Contreras',owner:'',hr:0}
].map(player=>({...player,stats:HRD.emptyStats()}));
HRD.config={
 schedule:'https://statsapi.mlb.com/api/v1/schedule',
 liveFeed:'https://statsapi.mlb.com/api/v1.1/game',
 startDate:'2026-07-13',
 endDate:'2026-07-14',
 bonusDistance:440,
 liveRefreshMs:12000,
 idleRefreshMs:60000
};
const saved=JSON.parse(localStorage.getItem('hrDerby2026Players')||'null');
HRD.players=(saved||structuredClone(HRD.defaults)).map(player=>({...player,stats:{...HRD.emptyStats(),...(player.stats||{})}}));
HRD.state={lastRefresh:localStorage.getItem('hrDerby2026Refresh')||'',source:localStorage.getItem('hrDerby2026Source')||'Manual',isLive:false,eventStatus:'Waiting for event',lastPlay:'',changedPlayers:[]};
HRD.persist=function(){localStorage.setItem('hrDerby2026Players',JSON.stringify(HRD.players));localStorage.setItem('hrDerby2026Refresh',HRD.state.lastRefresh);localStorage.setItem('hrDerby2026Source',HRD.state.source)};
HRD.norm=function(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')};