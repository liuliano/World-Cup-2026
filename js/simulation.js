window.WC = window.WC || {};

WC.winProbability = function winProbability(teamA, teamB) {
  const a = WC.strength[teamA] || 60;
  const b = WC.strength[teamB] || 60;
  const p = a / (a + b);
  return Math.max(0.12, Math.min(0.88, p));
};

WC.playSimGame = function playSimGame(a, b) {
  if (!b) return a;
  return Math.random() < WC.winProbability(a.t, b.t) ? a : b;
};

WC.simulateTournament = function simulateTournament(iterations = 8000) {
  const base = WC.getAlive().map(([team, owner]) => ({ t: team, o: owner }));
  const wins = {};

  base.forEach((entry) => {
    wins[entry.o] = 0;
  });

  for (let i = 0; i < iterations; i += 1) {
    const q1 = WC.playSimGame(base[0], base[1]);
    const q2 = WC.playSimGame(base[2], base[3]);
    const q3 = WC.playSimGame(base[4], base[5]);
    const q4 = WC.playSimGame(base[6], base[7]);
    const s1 = WC.playSimGame(q1, q2);
    const s2 = WC.playSimGame(q3, q4);
    const champion = WC.playSimGame(s1, s2);
    wins[champion.o] += 1;
  }

  const cards = WC.getOwnerCards();
  return Object.entries(wins)
    .map(([owner, winCount]) => ({
      o: owner,
      p: (winCount / iterations) * 100,
      teams: cards[owner]?.live || []
    }))
    .sort((a, b) => b.p - a.p);
};

WC.oddsMove = function oddsMove(owner, probability) {
  const previous = (WC.state.previousOdds.find((row) => row.o === owner) || {}).p;
  if (previous == null) return '— +0.0%';

  const change = probability - previous;
  const arrow = change > 0 ? '▲' : change < 0 ? '▼' : '—';
  return `${arrow} ${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};