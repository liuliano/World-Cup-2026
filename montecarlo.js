import { POOL_OWNERS, ownerOriginal, norm, strengthScore } from './data.js';
import { R32 } from './lines.js';

export function winProb(teamA, teamB, lineForA) {
  const sA = strengthScore(teamA), sB = strengthScore(teamB);
  let p = sA / (sA + sB);
  if (lineForA !== null && lineForA !== undefined && lineForA !== '') {
    const l = Number(lineForA);
    if (l === 0) p = 0.50;
    else if (l === -0.5) p = 0.58;
    else if (l === -1.5) p = 0.72;
    else if (l === -2.5) p = 0.84;
    else if (l === 0.5) p = 0.42;
    else if (l === 1.5) p = 0.28;
    else if (l === 2.5) p = 0.16;
  }
  return Math.min(0.92, Math.max(0.08, p));
}

function simulatedWinner(match, lines) {
  return Math.random() < winProb(match.home, match.away, lines[match.id]) ? match.home : match.away;
}

function simulatedOwner(match, winner, current, lines) {
  const line = lines[match.id];
  if (line === null || line === undefined || line === '') return current[norm(winner)] || ownerOriginal(winner);
  const fav = match.home, dog = match.away;
  if (norm(winner) !== norm(fav)) return current[norm(winner)] || ownerOriginal(winner);
  const l = Math.abs(Number(line));
  let cover = 0.55;
  if (l === 0.5) cover = 0.68;
  if (l === 1.5) cover = 0.48;
  if (l === 2.5) cover = 0.34;
  return Math.random() < cover ? (current[norm(fav)] || ownerOriginal(fav)) : (current[norm(dog)] || ownerOriginal(dog));
}

export function runPoolSimulation({ iterations = 3000, lines, getResult, gameWinner, takeoverOwner }) {
  const ownerWins = Object.fromEntries(POOL_OWNERS.map(p => [p.owner, 0]));
  const ownerEV = Object.fromEntries(POOL_OWNERS.map(p => [p.owner, 0]));
  for (let i = 0; i < iterations; i++) {
    const current = {};
    for (const p of POOL_OWNERS) for (const t of p.teams) current[norm(t)] = p.owner;
    let roundTeams = [];
    for (const match of R32) {
      const actual = getResult(match.home, match.away);
      const winner = actual ? gameWinner(actual) : simulatedWinner(match, lines);
      const newOwner = actual ? takeoverOwner(match, actual, current) : simulatedOwner(match, winner, current, lines);
      current[norm(winner)] = newOwner;
      roundTeams.push(norm(winner));
    }
    while (roundTeams.length > 1) {
      const next = [];
      for (let j = 0; j < roundTeams.length; j += 2) {
        const a = roundTeams[j], b = roundTeams[j + 1];
        if (!b) { next.push(a); continue; }
        next.push(Math.random() < winProb(a, b, null) ? a : b);
      }
      roundTeams = next;
    }
    const champ = roundTeams[0];
    const winningOwner = current[champ] || ownerOriginal(champ);
    if (winningOwner) ownerWins[winningOwner]++;
    for (const [team, owner] of Object.entries(current)) {
      if (ownerEV[owner] !== undefined) ownerEV[owner] += strengthScore(team) / iterations;
    }
  }
  return POOL_OWNERS.map(p => ({ owner: p.owner, winPct: (ownerWins[p.owner] / iterations) * 100, ev: ownerEV[p.owner] })).sort((a, b) => b.winPct - a.winPct);
}
