window.HRD=window.HRD||{};
HRD.emptyStats=()=>({maxDistance:null,avgDistance:null,maxExitVelocity:null,avgExitVelocity:null,bonusHomers:0,trackedHomers:0,lastDistance:null,lastExitVelocity:null});
HRD.assignments={
 'Kyle Schwarber':'Iuliano',
 'Junior Caminero':'J. Schwartz',
 'Munetaka Murakami':'Knox',
 'Jordan Walker':'Roynan',
 'Jac Caglianone':'E. Schwartz',
 'Bryce Harper':'Whelan',
 'Ben Rice':'McCartney',
 'Willson Contreras':'Dolan'
};
HRD.defaults=[
 {name:'Kyle Schwarber',owner:'Iuliano',hr:0},{name:'Junior Caminero',owner:'J. Schwartz',hr:0},{name:'Munetaka Murakami',owner:'Knox',hr:0},{name:'Jordan Walker',owner:'Roynan',hr:0},
 {name:'Jac Caglianone',owner:'E. Schwartz',hr:0},{name:'Bryce Harper',owner:'Whelan',hr:0},{name:'Ben Rice',owner:'McCartney',hr:0},{name:'Willson Contreras',owner:'Dolan',hr:0}
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
HRD.players=(saved||structuredClone(HRD.defaults)).map(player=>({...player,owner:HRD.assignments[player.name]||player.owner||'',stats:{...HRD.emptyStats(),...(player.stats||{})}}));
HRD.state={lastRefresh:localStorage.getItem('hrDerby2026Refresh')||'',source:localStorage.getItem('hrDerby2026Source')||'Manual',isLive:false,eventStatus:'Waiting for event',lastPlay:'',changedPlayers:[]};
HRD.persist=function(){localStorage.setItem('hrDerby2026Players',JSON.stringify(HRD.players));localStorage.setItem('hrDerby2026Refresh',HRD.state.lastRefresh);localStorage.setItem('hrDerby2026Source',HRD.state.source)};
HRD.norm=function(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')};