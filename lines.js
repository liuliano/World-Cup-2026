export const R32=[
{id:'r32-1',home:'Germany',homeOwner:'Madden',line:-1.5,away:'Paraguay',awayOwner:'Whelan',date:'',next:'r16-1'},
{id:'r32-2',home:'France',homeOwner:'Knox',line:-1.5,away:'Sweden',awayOwner:'Whelan',date:'',next:'r16-1'},
{id:'r32-3',home:'Canada',homeOwner:'Baxter',line:-0.5,away:'South Africa',awayOwner:'Joe',date:'2026-06-28T15:00:00-04:00',next:'r16-2'},
{id:'r32-4',home:'Netherlands',homeOwner:'Nixon',line:-0.5,away:'Morocco',awayOwner:'Nolan',date:'2026-06-29T21:00:00-04:00',next:'r16-2'},
{id:'r32-5',home:'Portugal',homeOwner:'Roynan',line:-0.5,away:'Croatia',awayOwner:'J. Schwartz',date:'',next:'r16-3'},
{id:'r32-6',home:'Spain',homeOwner:'Whelan',line:-1.5,away:'Austria',awayOwner:'E. Schwartz',date:'',next:'r16-3'},
{id:'r32-7',home:'United States',homeOwner:'Merc',line:-1.5,away:'Bosnia & Herzegovina',awayOwner:'Nolan',date:'2026-07-01T20:00:00-04:00',next:'r16-4'},
{id:'r32-8',home:'Belgium',homeOwner:'J. Schwartz',line:-0.5,away:'Senegal',awayOwner:'Dolan',date:'',next:'r16-4'},
{id:'r32-9',home:'Brazil',homeOwner:'Gal',line:-0.5,away:'Japan',awayOwner:'Larry',date:'2026-06-29T13:00:00-04:00',next:'r16-5'},
{id:'r32-10',home:'Norway',homeOwner:'Knox',line:-0.5,away:'Ivory Coast',awayOwner:'Larry',date:'2026-06-30T13:00:00-04:00',next:'r16-5'},
{id:'r32-11',home:'Mexico',homeOwner:'Merc',line:-0.5,away:'Ecuador',awayOwner:'Roynan',date:'2026-06-30T21:00:00-04:00',next:'r16-6'},
{id:'r32-12',home:'England',homeOwner:'Joe',line:-1.5,away:'DR Congo',awayOwner:'McCartney',date:'',next:'r16-6'},
{id:'r32-13',home:'Argentina',homeOwner:'McCartney',line:-2.5,away:'Cape Verde',awayOwner:'J. Schwartz',date:'',next:'r16-7'},
{id:'r32-14',home:'Australia',homeOwner:'Nixon',line:0,away:'Egypt',awayOwner:'Joe',date:'',next:'r16-7'},
{id:'r32-15',home:'Switzerland',homeOwner:'E. Schwartz',line:-0.5,away:'Algeria',awayOwner:'Madden',date:'2026-07-02T23:00:00-04:00',next:'r16-8'},
{id:'r32-16',home:'Colombia',homeOwner:'Baxter',line:-0.5,away:'Ghana',awayOwner:'Baxter',date:'',next:'r16-8'}
];
export const ESPN_URL='https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=500';
export function fmtLine(n){if(n===null||n===undefined||n==='')return 'TBD';const x=Number(n);if(x===0)return 'PK';return x>0?'+'+x:String(x);}
export function oppLine(n){if(n===null||n===undefined||n==='')return '';const x=-Number(n);return x===0?0:x;}
