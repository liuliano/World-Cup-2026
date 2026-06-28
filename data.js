export const POOL_OWNERS=[
  {owner:'Baxter',teams:['Colombia','Canada','Ghana']},
  {owner:'Dolan',teams:['Senegal','Czech Republic','Saudi Arabia']},
  {owner:'E. Schwartz',teams:['Switzerland','Austria','Haiti']},
  {owner:'Gal',teams:['Brazil','South Korea','New Zealand']},
  {owner:'J. Schwartz',teams:['Belgium','Croatia','Cape Verde']},
  {owner:'Joe',teams:['England','Egypt','South Africa']},
  {owner:'Knox',teams:['France','Norway','Iraq']},
  {owner:'Larry',teams:['Japan','Ivory Coast','Jordan']},
  {owner:'Madden',teams:['Germany','Algeria','Tunisia']},
  {owner:'McCartney',teams:['Argentina','Türkiye','DR Congo']},
  {owner:'Merc',teams:['United States','Mexico','Curaçao']},
  {owner:'Nixon',teams:['Netherlands','Australia','Panama']},
  {owner:'Nolan',teams:['Morocco','Scotland','Bosnia & Herzegovina']},
  {owner:'Roynan',teams:['Portugal','Ecuador','Uzbekistan']},
  {owner:'Tonrey',teams:['Uruguay','Iran','Qatar']},
  {owner:'Whelan',teams:['Spain','Sweden','Paraguay']}
];
export const TEAM_RANKS={France:'#1',Brazil:'#2',Argentina:'#3',Spain:'#4',England:'#5',Portugal:'#6',Japan:'#7T',Netherlands:'#7T','Türkiye':'#9',Uruguay:'#10',Morocco:'#11',Norway:'#12','United States':'#13',Sweden:'#14',Belgium:'#15','South Korea':'#16T',Egypt:'#16T',Ecuador:'#16T','DR Congo':'#19',Germany:'#20',Colombia:'#21',Iraq:'#22T',Australia:'#22T','Ivory Coast':'#22T',Iran:'#22T',Switzerland:'#26',Mexico:'#27','South Africa':'#28',Scotland:'#29',Croatia:'#30T',Canada:'#30T',Paraguay:'#30T','New Zealand':'#30T',Senegal:'#34T',Uzbekistan:'#34T',Panama:'#34T',Qatar:'#37T','Cape Verde':'#37T',Austria:'#39T',Algeria:'#39T','Czech Republic':'#41T',Ghana:'#41T',Tunisia:'#43T','Curaçao':'#43T','Bosnia & Herzegovina':'#43T',Jordan:'#46T','Saudi Arabia':'#46T',Haiti:'#48'};
export const TEAM_CONTRIB={France:'7.5%',Brazil:'7.2%',Argentina:'7.0%',Spain:'6.5%',England:'6.0%',Portugal:'5.0%',Japan:'4.6%',Netherlands:'4.6%',Türkiye:'3.8%',Uruguay:'3.6%',Morocco:'3.3%',Norway:'2.8%','United States':'2.5%',Sweden:'2.4%',Belgium:'2.3%','South Korea':'2.0%',Egypt:'2.0%',Ecuador:'2.0%','DR Congo':'1.9%',Germany:'1.8%',Colombia:'1.7%',Iraq:'1.5%',Australia:'1.5%','Ivory Coast':'1.5%',Iran:'1.5%',Switzerland:'1.5%',Mexico:'1.4%','South Africa':'1.3%',Scotland:'1.2%',Croatia:'1.1%',Canada:'1.1%',Paraguay:'1.1%','New Zealand':'1.1%',Senegal:'1.0%',Uzbekistan:'1.0%',Panama:'1.0%',Qatar:'0.8%','Cape Verde':'0.8%',Austria:'0.7%',Algeria:'0.7%','Czech Republic':'0.6%',Ghana:'0.6%',Tunisia:'0.5%','Curaçao':'0.5%','Bosnia & Herzegovina':'0.5%',Jordan:'0.4%','Saudi Arabia':'0.4%',Haiti:'0.3%'};
export const OWNER_ODDS={McCartney:'12.7% ▼0.1',Knox:'11.8% ▼0.1',Gal:'10.3% ▲0.2',Whelan:'10.0% ▼0.7',Joe:'9.3% ▲0.1',Roynan:'8.0% ▲0.1',Nixon:'7.1% ▢',Larry:'6.5% ▲0.2',Tonrey:'5.9% ▲0.1',Nolan:'5.0% ▲0.1',Merc:'4.4% ▢','J. Schwartz':'4.2% ▲0.4',Baxter:'3.4% ▢',Madden:'3.0% ▢','E. Schwartz':'2.5% ▼0.2',Dolan:'2.0% ▼0.1'};
export function norm(t){const a={USA:'United States','United States of America':'United States',Turkey:'Türkiye',Turkiye:'Türkiye',Czechia:'Czech Republic','Bosnia and Herzegovina':'Bosnia & Herzegovina','Bosnia-Herzegovina':'Bosnia & Herzegovina','Congo DR':'DR Congo','Democratic Republic of Congo':'DR Congo','Côte d’Ivoire':'Ivory Coast',"Cote d'Ivoire":'Ivory Coast','Korea Republic':'South Korea',Curacao:'Curaçao','Boznia and Herzegovina':'Bosnia & Herzegovina'};return a[String(t||'').trim()]||String(t||'').trim();}
export function ownerOriginal(team){const n=norm(team);for(const p of POOL_OWNERS) if(p.teams.map(norm).includes(n)) return p.owner;return '';}
export function rank(team){return TEAM_RANKS[team]||'';}
export function strengthScore(team){const raw=String(TEAM_RANKS[team]||'#48').replace(/[^0-9]/g,'');const r=Number(raw)||48;return Math.max(1,55-r);}
