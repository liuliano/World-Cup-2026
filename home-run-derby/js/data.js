window.HRD=window.HRD||{};
HRD.defaults=[
 {name:'Kyle Schwarber',owner:'',hr:0},{name:'Junior Caminero',owner:'',hr:0},{name:'Munetaka Murakami',owner:'',hr:0},{name:'Jordan Walker',owner:'',hr:0},
 {name:'Jac Caglianone',owner:'',hr:0},{name:'Bryce Harper',owner:'',hr:0},{name:'Ben Rice',owner:'',hr:0},{name:'Willson Contreras',owner:'',hr:0}
];
HRD.config={
 scoreboard:'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
 summary:'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary',
 dates:'20260713-20260714',
 refreshMs:60000
};
HRD.players=JSON.parse(localStorage.getItem('hrDerby2026Players')||'null')||structuredClone(HRD.defaults);
HRD.state={lastRefresh:localStorage.getItem('hrDerby2026Refresh')||'',source:localStorage.getItem('hrDerby2026Source')||'Manual'};
HRD.persist=function(){localStorage.setItem('hrDerby2026Players',JSON.stringify(HRD.players));localStorage.setItem('hrDerby2026Refresh',HRD.state.lastRefresh);localStorage.setItem('hrDerby2026Source',HRD.state.source)};
HRD.norm=function(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')};