window.HRD=window.HRD||{};
HRD.emptyStats=()=>({maxDistance:null,avgDistance:null,maxExitVelocity:null,avgExitVelocity:null,bonusHomers:0,trackedHomers:null,lastDistance:null,lastExitVelocity:null});
HRD.assignments={
 'Kyle Schwarber':'Iuliano','Junior Caminero':'J. Schwartz','Munetaka Murakami':'Knox','Jordan Walker':'Roynan',
 'Jac Caglianone':'E. Schwartz','Bryce Harper':'Whelan','Ben Rice':'McCartney','Willson Contreras':'Dolan'
};
// Official MLB.com live snapshot captured during Round 1 at 8:58 p.m. ET.
HRD.defaults=[
 {name:'Kyle Schwarber',owner:'Iuliano',hr:0},
 {name:'Junior Caminero',owner:'J. Schwartz',hr:0},
 {name:'Munetaka Murakami',owner:'Knox',hr:0},
 {name:'Jordan Walker',owner:'Roynan',hr:13,stats:{maxDistance:470,avgDistance:null,maxExitVelocity:null,avgExitVelocity:null,bonusHomers:1,trackedHomers:null,lastDistance:null,lastExitVelocity:null}},
 {name:'Jac Caglianone',owner:'E. Schwartz',hr:0},
 {name:'Bryce Harper',owner:'Whelan',hr:0},
 {name:'Ben Rice',owner:'McCartney',hr:0},
 {name:'Willson Contreras',owner:'Dolan',hr:13,stats:{maxDistance:490,avgDistance:null,maxExitVelocity:null,avgExitVelocity:null,bonusHomers:1,trackedHomers:null,lastDistance:null,lastExitVelocity:null}}
].map(player=>({...player,stats:{...HRD.emptyStats(),...(player.stats||{})}}));
HRD.config={schedule:'https://statsapi.mlb.com/api/v1/schedule',liveFeed:'https://statsapi.mlb.com/api/v1.1/game',startDate:'2026-07-13',endDate:'2026-07-14',bonusDistance:440,liveRefreshMs:12000,idleRefreshMs:60000};
HRD.players=structuredClone(HRD.defaults);
HRD.state={lastRefresh:'8:58 PM ET',source:'Official MLB.com live snapshot; StatsAPI polling continues',isLive:true,eventStatus:'Round 1 in progress',lastPlay:'Willson Contreras and Jordan Walker each finished Round 1 with 13 home runs; Contreras holds the distance tiebreaker.',changedPlayers:[],currentHitter:'Jac Caglianone',timeRemaining:'',outsRemaining:null,biggestHomer:{name:'Willson Contreras',owner:'Dolan',value:490},hardestHit:null,oddsHistory:[]};
HRD.persist=function(){localStorage.setItem('hrDerby2026MlbCache',JSON.stringify({players:HRD.players,lastRefresh:HRD.state.lastRefresh,source:HRD.state.source,savedAt:Date.now()}));};
HRD.norm=function(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')};