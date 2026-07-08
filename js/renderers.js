window.WC = window.WC || {};

WC.renderRound16 = function renderRound16() {
  WC.$('r16').innerHTML = WC.round16Games.map(WC.gameCard).join('');
};

WC.renderQuarterfinals = function renderQuarterfinals() {
  WC.$('qf').innerHTML = WC.qfGames.map(WC.gameCard).join('');
};

WC.getPossibleWinners = function getPossibleWinners(game) {
  const resolved = WC.resolveGame(game);
  if (resolved) return [{ team: resolved.team, owner: resolved.owner }];
  return [{ team: game.h, owner: game.ho }, { team: game.a, owner: game.ao }];
};

WC.scenarioBadge = function scenarioBadge(item) {
  return `<span class="badge">${item.team}<span class="owner">${item.owner}</span></span>`;
};

WC.semifinalScenarioBlock = function semifinalScenarioBlock(leftGame, rightGame) {
  const left = WC.getPossibleWinners(leftGame);
  const right = WC.getPossibleWinners(rightGame);
  return `<div style="border-top:1px solid #1e293b;margin-top:12px;padding-top:10px"><div class="muted">Possible owner / team scenarios</div><div style="margin-top:8px"><div class="muted">Slot 1</div>${left.map(WC.scenarioBadge).join('')}</div><div style="margin-top:8px"><div class="muted">Slot 2</div>${right.map(WC.scenarioBadge).join('')}</div></div>`;
};

WC.semifinalCard = function semifinalCard(game, leftGame, rightGame) {
  const result = WC.resolveGame(game);
  return `<div class="card"><div class="muted">${game.date} · ${WC.isFinal(game) ? 'Final' : 'Scheduled'}<br>📍 ${game.venue}</div><b>${game.h} vs ${game.a}</b><div class="team"><span>${game.h} ${WC.rankBadge(game.h)}<span class="owner">${game.ho}</span></span><span><b>${game.hs ?? 0}</b> <span class="${WC.spreadClass(game.line)}">${WC.spreadText(game.line)}</span></span></div><div class="team"><span>${game.a} ${WC.rankBadge(game.a)}<span class="owner">${game.ao}</span></span><span><b>${game.as ?? 0}</b> <span class="${WC.spreadClass(-game.line)}">${WC.spreadText(-game.line)}</span></span></div>${result ? `<div class="muted">Winner advances: <b>${result.team}</b> · Owner now: <b>${result.owner}</b></div>` : ''}${WC.semifinalScenarioBlock(leftGame, rightGame)}</div>`;
};

WC.renderSemifinals = function renderSemifinals() {
  const games = WC.getSemifinalGames();
  WC.$('sf').innerHTML = [WC.semifinalCard(games[0], WC.qfGames[0], WC.qfGames[1]), WC.semifinalCard(games[1], WC.qfGames[2], WC.qfGames[3])].join('');
};

WC.renderFinal = function renderFinal() {
  WC.$('finals').innerHTML = WC.gameCard(WC.getFinalGame());
};

WC.renderTakeoverHistory = function renderTakeoverHistory(takeovers) {
  WC.$('history').innerHTML = takeovers.map((event) => `<div class="card take"><b>🔁 ${event[0]}</b><br>${event[1]} → <b>${event[2]}</b><br><b>Spread:</b> ${event[3]}<br><b>Final:</b> ${event[4]}<br><b>Reason:</b> ${event[5]}</div>`).join('');
};

WC.renderChampionshipProbability = function renderChampionshipProbability(rows, takeovers) {
  WC.$('odds').innerHTML = `<table><tr><th>Rank</th><th>Owner</th><th>Odds</th><th>Move</th><th>Teams</th></tr>${rows.map((row, index) => `<tr><td>#${index + 1}</td><td><b>${row.o}</b></td><td><b>${row.p.toFixed(1)}%</b><div class="bar"><div class="fill" style="width:${row.p}%"></div></div></td><td>${WC.oddsMove(row.o, row.p)}</td><td>${row.teams.map((team) => `<span class="badge">${takeovers.some((x) => x[0] === team) ? '🔁 ' : ''}${team}</span>`).join('')}</td></tr>`).join('')}</table>`;
};

WC.renderOwnerCards = function renderOwnerCards(cards, takeovers) {
  WC.$('owners').innerHTML = Object.entries(cards).sort().map(([owner, value]) => `<div class="card"><b>${owner}</b><br>${value.live.map((team) => `<span class="badge">${takeovers.some((x) => x[0] === team) ? '🔁 ' : ''}${team}</span>`).join('')}${value.out.map((team) => `<span class="badge elim">${team} ❌</span>`).join('')}</div>`).join('');
};

WC.currentRoundRecap = function currentRoundRecap() {
  const qfDone = WC.qfGames.filter(WC.isFinal).length;
  const sfDone = WC.getSemifinalGames().filter(WC.isFinal).length;
  if (qfDone === 4 || sfDone > 0) return `Semifinals: ${sfDone} of 2 Finals`;
  return `Quarterfinals: ${qfDone} of 4 Finals`;
};

WC.renderDashboard = function renderDashboard() {
  const rows = WC.simulateTournament();
  const takeovers = WC.getTakeovers();
  const cards = WC.getOwnerCards();
  const eliminatedCount = Object.values(cards).reduce((total, card) => total + card.out.length, 0);
  const leader = rows[0];
  WC.$('stamp').textContent = WC.state.lastRefresh === 'Never' ? 'World Cup: not refreshed yet' : `World Cup updated: ${WC.state.lastRefresh}`;
  WC.$('recap').innerHTML = `✔ ${WC.currentRoundRecap()}<br>🔁 Takeovers: ${takeovers.length}<br>👥 Teams Remaining: ${WC.getAlive().length}<br>🏆 Leader: <b>${leader.o}</b> ${leader.p.toFixed(1)}%`;
  WC.$('insights').innerHTML = `Alive teams: <b>${WC.getAlive().length}</b><br>Eliminated shown: <b>${eliminatedCount}</b>`;
  WC.$('top').innerHTML = `<div class="card"><span>Round</span><div class="big">Quarterfinals</div></div><div class="card"><span>Takeovers</span><div class="big">${takeovers.length}</div></div>`;
  WC.renderTakeoverHistory(takeovers);
  WC.renderChampionshipProbability(rows, takeovers);
  WC.renderOwnerCards(cards, takeovers);
  WC.renderRound16();
  WC.renderQuarterfinals();
  WC.renderSemifinals();
  WC.renderFinal();
};