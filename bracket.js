import { rank } from './data.js';
import { R32, fmtLine, oppLine } from './lines.js';

export function displaySeed(value) {
  if (value === null || value === undefined) return 'TBD';
  if (typeof value === 'string') return value === '[object Object]' ? 'TBD' : value;
  if (typeof value === 'object') {
    if (value.home && value.away) return `Winner of ${shortTeam(value.home)}/${shortTeam(value.away)}`;
    if (value.team) return value.team;
    return 'TBD';
  }
  return String(value);
}

export function shortTeam(value) {
  const s = displaySeed(value);
  return s.startsWith('Winner of ') ? 'TBD' : s;
}

export function pairSeeds(list, round) {
  const out = [];
  for (let i = 0; i < list.length; i += 2) {
    out.push({ home: displaySeed(list[i] || 'TBD'), away: displaySeed(list[i + 1] || 'TBD'), round });
  }
  return out;
}

export function pairWinners(matches, getResult, gameWinner) {
  const winners = matches.map(m => {
    const res = getResult(m.home, m.away);
    const w = gameWinner(res);
    return w || `Winner of ${m.home}/${m.away}`;
  });
  return pairSeeds(winners, 'Round of 16');
}

function col(title, cards) {
  return `<div class="round-col"><div class="round-title">${title}</div>${cards.join('')}</div>`;
}

function cardGeneric(m) {
  const h = displaySeed(m.home), a = displaySeed(m.away);
  return `<div class="game"><div class="game-time">${m.round}</div><div class="game-team"><span class="name">${rank(h)} ${h}</span><span></span></div><div class="game-team"><span class="name">${rank(a)} ${a}</span><span></span></div></div>`;
}

function cardMatch(m, st, getResult, gameWinner, teamLine, lines) {
  const res = getResult(m.home, m.away);
  const w = gameWinner(res);
  const ln = lines[m.id];
  return `<div class="game"><div class="game-time">${m.date ? new Date(m.date).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Time TBD'}</div>${teamLine(m.home, res, w)}${teamLine(m.away, res, w)}<div class="owner-chip">${st.current[m.home] || m.homeOwner} / ${st.current[m.away] || m.awayOwner}</div><div>${fmtLine(ln)} / ${ln !== null && ln !== undefined ? fmtLine(oppLine(ln)) : 'TBD'}</div></div>`;
}

export function renderBracket({ box, bracketMode, state, getResult, gameWinner, teamLine, lines }) {
  box.classList.toggle('stack', bracketMode === 'stack');
  const r16 = pairWinners(R32, getResult, gameWinner);
  const qf = pairSeeds(r16, 'Quarterfinals');
  const sf = pairSeeds(qf, 'Semifinals');
  const final = pairSeeds(sf, 'Final');
  box.innerHTML = [
    col('Round of 32', R32.map(m => cardMatch(m, state, getResult, gameWinner, teamLine, lines))),
    col('Round of 16', r16.map(cardGeneric)),
    col('Quarterfinals', qf.map(cardGeneric)),
    col('Semifinals', sf.map(cardGeneric)),
    col('Final', final.map(cardGeneric)),
    col('Champion', ["<div class='game'><div class='game-time'>Champion not decided</div></div>"])
  ].join('').replaceAll('[object Object]', 'TBD');
}
