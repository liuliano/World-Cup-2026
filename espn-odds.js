// ESPN/DraftKings odds helper for future integration.
// ESPN scoreboard odds often include a spread object inside competition odds.

export function extractSpreadFromCompetition(event) {
  const comp = event?.competitions?.[0];
  const odds = comp?.odds?.[0] || event?.odds?.[0] || null;
  if (!odds) return null;

  const details = String(odds.details || odds.spreadDetails || '');
  const spread = odds.spread ?? odds.homeTeamOdds?.spread ?? null;

  return {
    provider: odds.provider?.name || odds.provider || 'ESPN/DraftKings',
    details,
    spread: spread === null || spread === undefined ? null : Number(spread),
    timestamp: new Date().toISOString()
  };
}

export function lockCurrentLines(matches, espnEvents) {
  const locked = {};
  for (const match of matches) {
    const event = espnEvents.find(ev => {
      const comp = ev?.competitions?.[0];
      const teams = (comp?.competitors || []).map(c => c?.team?.displayName || c?.team?.name || '');
      return teams.includes(match.home) && teams.includes(match.away);
    });
    const spread = extractSpreadFromCompetition(event);
    locked[match.id] = spread?.spread ?? match.line ?? null;
  }
  return locked;
}
