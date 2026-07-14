window.HRD=window.HRD||{};
HRD.emptyStats=()=>({maxDistance:null,avgDistance:null,maxExitVelocity:null,avgExitVelocity:null,bonusHomers:0,trackedHomers:null,lastDistance:null,lastExitVelocity:null});
HRD.assignments={
 'Kyle Schwarber':'Iuliano','Junior Caminero':'J. Schwartz','Munetaka Murakami':'Knox','Jordan Walker':'Roynan',
 'Jac Caglianone':'E. Schwartz','Bryce Harper':'Whelan','Ben Rice':'McCartney','Willson Contreras':'Dolan'
};
// Final 2026 Home Run Derby results.
HRD.defaults=[
 {name:'Kyle Schwarber',owner:'Iuliano',hr:30,rounds:{round1:10,semifinal:9,final:11}},
 {name:'Junior Caminero',owner:'J. Schwartz',hr:17,rounds:{round1:12,semifinal:5,final:null}},
 {name:'Munetaka Murakami',owner:'Knox',hr:9,rounds:{round1:9,semifinal:null,final:null},stats:{maxDistance:466}},
 {name:'Jordan Walker',owner:'Roynan',hr:31,rounds:{round1:13,semifinal:6,final:12},stats:{maxDistance:470}},
 {name:'Jac Caglianone',owner:'E. Schwartz',hr:8,rounds:{round1:8,semifinal:null,final:null}},
 {name:'Bryce Harper',owner:'Whelan',hr:8,rounds:{round1:8,semifinal:null,final:null}},
 {name:'Ben Rice',owner:'McCartney',hr:7,rounds:{round1:7,semifinal:null,final:null}},
 {name:'Willson Contreras',owner:'Dolan',hr:21,rounds:{round1:13,semifinal:8,final:null},stats:{maxDistance:490}}
].map(player=>({...player,stats:{...HRD.emptyStats(),...(player.stats||{})}}));
HRD.config={schedule:'https://statsapi.mlb.com/api/v1/schedule',liveFeed:'https://statsapi.mlb.com/api/v1.1/game',startDate:'2026-07-13',endDate:'2026-07-14',bonusDistance:440,liveRefreshMs:12000,idleRefreshMs:60000,eventComplete:true};
HRD.players=structuredClone(HRD.defaults);
HRD.state={lastRefresh:'Final',source:'Final published Derby results',isLive:false,eventStatus:'Complete · Jordan Walker is the 2026 Home Run Derby champion',lastPlay:'Jordan Walker defeated Kyle Schwarber 12–11 in the final, finishing with 31 total home runs.',changedPlayers:[],currentHitter:'',timeRemaining:'',outsRemaining:null,biggestHomer:{name:'Willson Contreras',owner:'Dolan',value:490},hardestHit:null,oddsHistory:[]};
HRD.persist=function(){};
HRD.norm=function(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')};