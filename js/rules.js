window.WC = window.WC || {};

WC.norm = function norm(value) {
  return String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '').replace('usa', 'unitedstates');
};

WC.spreadText = function spreadText(line) {
  return line === 0 ? 'PK' : line > 0 ? `+${line}` : String(line);
};

WC.spreadClass = function spreadClass(line) {
  return line === 0 ? 'pk' : line < 0 ? 'fav' : 'dog';
};

WC.isFinal = function isFinal(game) {
  return game.final === true || game.status === 'Final';
};

WC.ownerAtKick = function ownerAtKick(game, team) {
  return team === game.h ? game.ho : game.ao;
};

WC.resolveGame = function resolveGame(game) {
  if (!WC.isFinal(game) || game.hs === null || game.as === null) return null;
  const winner = game.hs > game.as ? game.h : game.a;
  const loser = winner === game.h ? game.a : game.h;
  const favorite = game.line < 0 ? game.h : game.line > 0 ? game.a : null;
  const underdog = game.line < 0 ? game.a : game.line > 0 ? game.h : null;
  let owner = WC.ownerAtKick(game, winner);
  let event = null;

  if (favorite && winner === favorite) {
    const favoriteCovered = favorite === game.h ? game.hs + game.line > game.as : game.as - game.line > game.hs;
    if (!favoriteCovered) {
      owner = WC.ownerAtKick(game, underdog);
      event = [favorite, WC.ownerAtKick(game, favorite), owner,
        `${game.h} ${WC.spreadText(game.line)} | ${game.a} ${WC.spreadText(-game.line)}`,
        `${game.h} ${game.hs}-${game.as} ${game.a}`,
        `${underdog} covered. ${owner} takes over ${favorite}.`];
    }
  }
  return { team: winner, owner, loser, loserOwner: WC.ownerAtKick(game, loser), event };
};

WC.getAdvancementScenarios = function getAdvancementScenarios(game) {
  const resolved = WC.resolveGame(game);
  if (resolved) return [{ team: resolved.team, owner: resolved.owner, reason: 'Confirmed' }];
  const scenarios = [];
  const add = (team, owner, reason) => {
    if (!scenarios.some((item) => item.team === team && item.owner === owner)) scenarios.push({ team, owner, reason });
  };
  add(game.h, game.ho, game.line < 0 ? `${game.h} wins and covers` : `${game.h} wins`);
  add(game.a, game.ao, game.line > 0 ? `${game.a} wins and covers` : `${game.a} wins`);
  if (game.line < 0 && game.ao && game.ao !== game.ho) add(game.h, game.ao, `${game.h} wins; ${game.a} covers`);
  if (game.line > 0 && game.ho && game.ho !== game.ao) add(game.a, game.ho, `${game.a} wins; ${game.h} covers`);
  return scenarios;
};

WC.getLoserScenarios = function getLoserScenarios(game) {
  const resolved = WC.resolveGame(game);
  if (resolved) return [{ team: resolved.loser, owner: resolved.loserOwner, reason: 'Confirmed' }];
  return [
    { team: game.h, owner: game.ho, reason: `${game.h} loses semifinal` },
    { team: game.a, owner: game.ao, reason: `${game.a} loses semifinal` }
  ].filter((item) => item.team && !item.team.startsWith('Winner '));
};

WC.findEspnEvent = function findEspnEvent(team1, team2, datePrefix) {
  const events = WC.espnKnockoutEvents || [];
  const direct = events.find((event) => {
    const teams = [WC.norm(event.home), WC.norm(event.away)];
    return teams.includes(WC.norm(team1)) && teams.includes(WC.norm(team2));
  });
  if (direct) return direct;
  return events.find((event) => event.dateIso?.startsWith(datePrefix)) || null;
};

WC.applyEspnEvent = function applyEspnEvent(game, event) {
  if (!event) return game;
  const direct = WC.norm(game.h) === WC.norm(event.home);
  return {
    ...game,
    date: event.date || game.date,
    venue: event.venue || game.venue,
    status: event.status || game.status,
    final: event.final === true,
    hs: direct ? event.hs : event.as,
    as: direct ? event.as : event.hs
  };
};

WC.getSemifinalGames = function getSemifinalGames() {
  const a = WC.resolveGame(WC.qfGames[0]);
  const b = WC.resolveGame(WC.qfGames[1]);
  const c = WC.resolveGame(WC.qfGames[2]);
  const d = WC.resolveGame(WC.qfGames[3]);

  const sf1 = {
    h: a?.team || 'Winner France/Morocco', ho: a?.owner || '',
    a: b?.team || 'Winner Spain/Belgium', ao: b?.owner || '',
    line: 0, hs: null, as: null, status: 'Scheduled', final: false,
    date: 'Jul 14, 3:00 PM EDT', venue: 'AT&T Stadium — Arlington, Texas'
  };

  const sf2 = {
    h: c?.team || 'Winner England/Norway', ho: c?.owner || '',
    a: d?.team || 'Winner Argentina/Switzerland', ao: d?.owner || '',
    line: 0, hs: null, as: null, status: 'Scheduled', final: false,
    date: 'Jul 15, 3:00 PM EDT', venue: 'Mercedes-Benz Stadium — Atlanta, Georgia'
  };

  return [
    WC.applyEspnEvent(sf1, WC.findEspnEvent(sf1.h, sf1.a, '2026-07-14')),
    WC.applyEspnEvent(sf2, WC.findEspnEvent(sf2.h, sf2.a, '2026-07-15'))
  ];
};

WC.getFinalGame = function getFinalGame() {
  const semifinals = WC.getSemifinalGames();
  const first = WC.resolveGame(semifinals[0]);
  const second = WC.resolveGame(semifinals[1]);
  const game = {
    h: first?.team || 'Winner SF1', ho: first?.owner || '',
    a: second?.team || 'Winner SF2', ao: second?.owner || '',
    line: first?.team === 'Spain' ? -0.5 : second?.team === 'Spain' ? 0.5 : 0,
    hs: null, as: null, status: 'Scheduled', final: false,
    date: 'Jul 19, 3:00 PM EDT', venue: 'MetLife Stadium — East Rutherford, New Jersey'
  };
  return WC.applyEspnEvent(game, WC.findEspnEvent(game.h, game.a, '2026-07-19'));
};

WC.getBronzeGame = function getBronzeGame() {
  const semifinals = WC.getSemifinalGames();
  const first = WC.resolveGame(semifinals[0]);
  const second = WC.resolveGame(semifinals[1]);
  const game = {
    h: first?.loser || 'Loser SF1', ho: first?.loserOwner || '',
    a: second?.loser || 'Loser SF2', ao: second?.loserOwner || '',
    line: 0, hs: null, as: null, status: 'Scheduled', final: false,
    date: 'Jul 18, 5:00 PM EDT', venue: 'Hard Rock Stadium — Miami, Florida'
  };
  return WC.applyEspnEvent(game, WC.findEspnEvent(game.h, game.a, '2026-07-18'));
};

WC.getAlive = function getAlive() {
  const qfAlive = [];
  WC.qfGames.forEach((game) => {
    const result = WC.resolveGame(game);
    if (result) qfAlive.push([result.team, result.owner]);
    else {
      qfAlive.push([game.h, game.ho]);
      qfAlive.push([game.a, game.ao]);
    }
  });

  const semifinals = WC.getSemifinalGames();
  const anySemifinalStarted = semifinals.some((game) => WC.isFinal(game) || (game.status && game.status !== 'Scheduled'));
  if (!anySemifinalStarted) return qfAlive;

  const alive = [];
  semifinals.forEach((game) => {
    const result = WC.resolveGame(game);
    if (result) alive.push([result.team, result.owner]);
    else {
      if (game.h && !game.h.startsWith('Winner ')) alive.push([game.h, game.ho]);
      if (game.a && !game.a.startsWith('Winner ')) alive.push([game.a, game.ao]);
    }
  });

  return alive;
};

WC.getTakeovers = function getTakeovers() {
  const takeovers = WC.baseTakeovers.slice();
  WC.round16Games.concat(WC.qfGames, WC.getSemifinalGames(), [WC.getFinalGame()]).forEach((game) => {
    const result = WC.resolveGame(game);
    if (result?.event) takeovers.push(result.event);
  });
  return takeovers;
};

WC.getOwnerCards = function getOwnerCards() {
  const liveTeams = new Set(WC.getAlive().map(([team]) => team));
  const cards = {};
  Object.entries(WC.ownerHistory).forEach(([owner, teams]) => {
    cards[owner] = { live: [], out: [] };
    teams.forEach((team) => (liveTeams.has(team) ? cards[owner].live : cards[owner].out).push(team));
  });
  WC.getAlive().forEach(([team, owner]) => {
    Object.values(cards).forEach((card) => {
      card.live = card.live.filter((x) => x !== team);
      card.out = card.out.filter((x) => x !== team);
    });
    cards[owner] ??= { live: [], out: [] };
    if (!cards[owner].live.includes(team)) cards[owner].live.push(team);
  });
  return cards;
};