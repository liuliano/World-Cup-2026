window.WC = window.WC || {};

WC.norm = function norm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '')
    .replace('usa', 'unitedstates');
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
  if (!WC.isFinal(game)) return null;
  if (game.hs === null || game.as === null) return null;

  const winner = game.hs > game.as ? game.h : game.a;
  const loser = winner === game.h ? game.a : game.h;
  const favorite = game.line < 0 ? game.h : game.line > 0 ? game.a : null;
  const underdog = game.line < 0 ? game.a : game.line > 0 ? game.h : null;

  let owner = WC.ownerAtKick(game, winner);
  let event = null;

  if (favorite && winner === favorite) {
    const favoriteCovered = favorite === game.h
      ? game.hs + game.line > game.as
      : game.as - game.line > game.hs;

    if (!favoriteCovered) {
      owner = WC.ownerAtKick(game, underdog);
      event = [
        favorite,
        WC.ownerAtKick(game, favorite),
        owner,
        `${game.h} ${WC.spreadText(game.line)} | ${game.a} ${WC.spreadText(-game.line)}`,
        `${game.h} ${game.hs}-${game.as} ${game.a}`,
        `${underdog} covered. ${owner} takes over ${favorite}.`
      ];
    }
  }

  return { team: winner, owner, loser, event };
};

WC.getSemifinalGames = function getSemifinalGames() {
  const a = WC.resolveGame(WC.qfGames[0]);
  const b = WC.resolveGame(WC.qfGames[1]);
  const c = WC.resolveGame(WC.qfGames[2]);
  const d = WC.resolveGame(WC.qfGames[3]);

  return [
    {
      h: a?.team || 'Winner France/Morocco',
      ho: a?.owner || '',
      a: b?.team || 'Winner Spain/Belgium',
      ao: b?.owner || '',
      line: 0,
      hs: null,
      as: null,
      date: 'Semifinal',
      venue: 'TBD'
    },
    {
      h: c?.team || 'Winner England/Norway',
      ho: c?.owner || '',
      a: d?.team || 'Winner Argentina/Switzerland',
      ao: d?.owner || '',
      line: 0,
      hs: null,
      as: null,
      date: 'Semifinal',
      venue: 'TBD'
    }
  ];
};

WC.getFinalGame = function getFinalGame() {
  return {
    h: 'Winner SF1',
    ho: '',
    a: 'Winner SF2',
    ao: '',
    line: 0,
    hs: null,
    as: null,
    date: 'Final',
    venue: 'TBD'
  };
};

WC.getAlive = function getAlive() {
  const alive = [];

  WC.qfGames.forEach((game) => {
    const result = WC.resolveGame(game);
    if (result) {
      alive.push([result.team, result.owner]);
    } else {
      alive.push([game.h, game.ho]);
      alive.push([game.a, game.ao]);
    }
  });

  return alive;
};

WC.getTakeovers = function getTakeovers() {
  const takeovers = WC.baseTakeovers.slice();
  WC.round16Games.concat(WC.qfGames).forEach((game) => {
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
    teams.forEach((team) => {
      (liveTeams.has(team) ? cards[owner].live : cards[owner].out).push(team);
    });
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