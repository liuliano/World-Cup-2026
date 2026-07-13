window.HRD=window.HRD||{};
HRD.emptyStats=()=>({maxDistance:null,avgDistance:null,maxExitVelocity:null,avgExitVelocity:null,bonusHomers:0,trackedHomers:0,lastDistance:null,lastExitVelocity:null});
HRD.assignments={
 'Kyle Schwarber':'Iuliano','Junior Caminero':'J. Schwartz','Munetaka Murakami':'Knox','Jordan Walker':'Roynan',
 'Jac Caglianone':'E. Schwartz','Bryce Harper':'Whelan','Ben Rice':'McCartney','Willson Contreras':'Dolan'
};
HRD.defaults=[
 {name:'Kyle Schwarber',owner:'Iuliano',hr:0},{name:'Junior Caminero',owner:'J. Schwartz',hr:0},{name:'Munetaka Murakami',owner:'Knox',hr:0},{name:'Jordan Walker',owner:'Roynan',hr:0},
 {name:'Jac Caglianone',owner:'E. Schwartz',hr:0},{name:'Bryce Harper',owner:'Whelan',hr:0},{name:'Ben Rice',owner:'McCartney',hr:0},{name:'Willson Contreras',owner:'Dolan',hr:0}
].map(player=>({...player,stats:HRD.emptyStats()}));
HRD.config={schedule:'https://statsapi.mlb.com/api/v1/schedule',liveFeed:'https://statsapi.mlb.com/api/v1.1/game',startDate:'2026-07-13',endDate:'2026-07-14',bonusDistance:440,liveRefreshMs:12000,idleRefreshMs:60000};
// Always start from the locked roster. Legacy locally edited scores and owners are intentionally ignored.
HRD.players=structuredClone(HRD.defaults);
HRD.state={lastRefresh:'',source:'MLB StatsAPI',isLive:false,eventStatus:'Waiting for MLB event data',lastPlay:'',changedPlayers:[]};
// Cache only data received during the current MLB-powered session. No user-entered scoring is accepted.
HRD.persist=function(){localStorage.setItem('hrDerby2026MlbCache',JSON.stringify({players:HRD.players,lastRefresh:HRD.state.lastRefresh,source:HRD.state.source,savedAt:Date.now()}));};
HRD.norm=function(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')};