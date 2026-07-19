window.WC = window.WC || {};

WC.FIRST_PRIZE = 1120;
WC.SECOND_PRIZE = 480;

WC.renderRound16 = function renderRound16() { WC.$('r16').innerHTML = WC.round16Games.map(WC.gameCard).join(''); };
WC.renderQuarterfinals = function renderQuarterfinals() { WC.$('qf').innerHTML = WC.qfGames.map(WC.gameCard).join(''); };

WC.scenarioBadge = function scenarioBadge(item) {
  return `<div class="scenario-chip"><span class="scenario-ball">⚽</span><span><b>${item.team}</b><small>${item.owner}</small><em>${item.reason || ''}</em></span></div>`;
};

WC.scenarioBlock = function scenarioBlock(title, first, second) {
  return `<div class="scenario-block"><div class="scenario-title">${title}</div><div class="scenario-slot"><span>Slot 1</span>${first.map(WC.scenarioBadge).join('')}</div><div class="scenario-slot"><span>Slot 2</span>${second.map(WC.scenarioBadge).join('')}</div></div>`;
};

WC.semifinalCard = function semifinalCard(game, leftGame, rightGame) {
  const confirmed = WC.resolveGame(leftGame) && WC.resolveGame(rightGame);
  const scenarios = confirmed ? '' : WC.scenarioBlock('Possible owner / team outcomes', WC.getAdvancementScenarios(leftGame), WC.getAdvancementScenarios(rightGame));
  return `<div class="card match-card soccer-card"><div class="match-kicker">🥅 ${game.date} · ${WC.isFinal(game) ? 'Final' : (game.status || 'Scheduled')}</div><div class="venue">📍 ${game.venue}</div><div class="match-title">${game.h} <span>vs</span> ${game.a}</div><div class="team"><span>${game.h} ${WC.rankBadge(game.h)}<span class="owner">${game.ho}</span></span><span><b>${game.hs ?? 0}</b> <span class="${WC.spreadClass(game.line)}">${WC.spreadText(game.line)}</span></span></div><div class="team"><span>${game.a} ${WC.rankBadge(game.a)}<span class="owner">${game.ao}</span></span><span><b>${game.as ?? 0}</b> <span class="${WC.spreadClass(-game.line)}">${WC.spreadText(-game.line)}</span></span></div>${scenarios}</div>`;
};

WC.renderSemifinals = function renderSemifinals() {
  const games = WC.getSemifinalGames();
  WC.$('sf').innerHTML = [WC.semifinalCard(games[0], WC.qfGames[0], WC.qfGames[1]), WC.semifinalCard(games[1], WC.qfGames[2], WC.qfGames[3])].join('');
};

WC.medalMatchCard = function medalMatchCard(game, icon, scenarioTitle, firstScenarios, secondScenarios, extraContent = '') {
  const result = WC.resolveGame(game);
  const scenarios = result ? '' : WC.scenarioBlock(scenarioTitle, firstScenarios, secondScenarios);
  return `<div class="card match-card final-card"><div class="match-kicker">${icon} ${game.date} · ${WC.isFinal(game) ? 'Final' : (game.status || 'Scheduled')}</div><div class="venue">📍 ${game.venue}</div><div class="match-title">${game.h} <span>vs</span> ${game.a}</div><div class="team"><span>${game.h} ${WC.rankBadge(game.h)}<span class="owner">${game.ho}</span></span><span><b>${game.hs ?? 0}</b> <span class="${WC.spreadClass(game.line)}">${WC.spreadText(game.line)}</span></span></div><div class="team"><span>${game.a} ${WC.rankBadge(game.a)}<span class="owner">${game.ao}</span></span><span><b>${game.as ?? 0}</b> <span class="${WC.spreadClass(-game.line)}">${WC.spreadText(-game.line)}</span></span></div>${result ? `<div class="muted">Winner: <b>${result.team}</b> · Owner: <b>${result.owner}</b></div>` : scenarios}${extraContent}</div>`;
};

WC.finalPayoutScenarios = function finalPayoutScenarios(game) {
  if (!game.ho || !game.ao || game.h.startsWith('Winner ') || game.a.startsWith('Winner ')) return '';
  return `<div class="scenario-block"><div class="scenario-title">💰 Win / Lose Payouts</div><div class="team"><span>If <b>${game.h}</b> wins<br><span class="owner">${game.ho}</span></span><span>🥇 <b>$${WC.FIRST_PRIZE.toLocaleString()}</b><br>${game.ao}: $${WC.SECOND_PRIZE.toLocaleString()}</span></div><div class="team"><span>If <b>${game.a}</b> wins<br><span class="owner">${game.ao}</span></span><span>🥇 <b>$${WC.FIRST_PRIZE.toLocaleString()}</b><br>${game.ho}: $${WC.SECOND_PRIZE.toLocaleString()}</span></div></div>`;
};

WC.renderFinal = function renderFinal() {
  const semifinalGames = WC.getSemifinalGames();
  const game = WC.getFinalGame();
  WC.$('finals').innerHTML = WC.medalMatchCard(game, '👑', 'Possible Final owner / team outcomes', WC.getAdvancementScenarios(semifinalGames[0]), WC.getAdvancementScenarios(semifinalGames[1]), WC.finalPayoutScenarios(game));
};

WC.renderBronze = function renderBronze() {
  const semifinalGames = WC.getSemifinalGames();
  const game = WC.getBronzeGame();
  WC.$('bronze').innerHTML = WC.medalMatchCard(game, '🥉', 'Possible Bronze Match owner / team outcomes', WC.getLoserScenarios(semifinalGames[0]), WC.getLoserScenarios(semifinalGames[1]));
};

WC.renderTakeoverHistory = function renderTakeoverHistory(takeovers) {
  WC.$('history').innerHTML = takeovers.map((event) => `<div class="card take"><b>🔁 ${event[0]}</b><br>${event[1]} → <b>${event[2]}</b><br><b>Spread:</b> ${event[3]}<br><b>Final:</b> ${event[4]}<br><b>Reason:</b> ${event[5]}</div>`).join('');
};

WC.renderChampionshipProbability = function renderChampionshipProbability(rows, takeovers) {
  const finalGame = WC.getFinalGame();
  const finalConfirmed = finalGame.ho && finalGame.ao && !finalGame.h.startsWith('Winner ') && !finalGame.a.startsWith('Winner ');

  if (finalConfirmed) {
    WC.$('odds').innerHTML = `<div class="scenario-title">💰 Final Prize Outcomes</div><table><tr><th>Team</th><th>Owner</th><th>If Win</th><th>If Lose</th></tr><tr class="leader-row"><td><b>${finalGame.h}</b></td><td><b>${finalGame.ho}</b></td><td>🥇 <b>$${WC.FIRST_PRIZE.toLocaleString()}</b></td><td>🥈 $${WC.SECOND_PRIZE.toLocaleString()}</td></tr><tr><td><b>${finalGame.a}</b></td><td><b>${finalGame.ao}</b></td><td>🥇 <b>$${WC.FIRST_PRIZE.toLocaleString()}</b></td><td>🥈 $${WC.SECOND_PRIZE.toLocaleString()}</td></tr></table>`;
    return;
  }

  WC.$('odds').innerHTML = `<table><tr><th>Rank</th><th>Owner</th><th>Odds</th><th>Move</th><th>Teams</th></tr>${rows.map((row, index) => `<tr class="${index === 0 ? 'leader-row' : ''}"><td>#${index + 1}</td><td><b>${row.o}</b></td><td><b>${row.p.toFixed(1)}%</b><div class="bar"><div class="fill" style="width:${row.p}%"></div></div></td><td>${WC.oddsMove(row.o, row.p)}</td><td>${row.teams.map((team) => `<span class="badge">${takeovers.some((x) => x[0] === team) ? '🔁 ' : '⚽ '}${team}</span>`).join('')}</td></tr>`).join('')}</table>`;
};

WC.renderOwnerCards = function renderOwnerCards(cards, takeovers) {
  WC.$('owners').innerHTML = Object.entries(cards).sort().map(([owner, value]) => `<div class="card owner-panel"><b>🧑‍💼 ${owner}</b><br>${value.live.map((team) => `<span class="badge alive-team">${takeovers.some((x) => x[0] === team) ? '🔁 ' : '⚽ '}${team}</span>`).join('')}${value.out.map((team) => `<span class="badge elim">${team} ❌</span>`).join('')}</div>`).join('');
};

WC.currentRoundRecap = function currentRoundRecap() {
  const qfDone = WC.qfGames.filter(WC.isFinal).length;
  const sfDone = WC.getSemifinalGames().filter(WC.isFinal).length;
  if (sfDone === 2) return 'Final and Bronze Match scheduled';
  if (qfDone === 4) return `Semifinals: ${sfDone} of 2 Finals`;
  return `Quarterfinals: ${qfDone} of 4 Finals`;
};

WC.renderDashboard = function renderDashboard() {
  const rows = WC.simulateTournament();
  const takeovers = WC.getTakeovers();
  const cards = WC.getOwnerCards();
  const eliminatedCount = Object.values(cards).reduce((total, card) => total + card.out.length, 0);
  const leader = rows[0];
  const qfDone = WC.qfGames.filter(WC.isFinal).length;
  const sfDone = WC.getSemifinalGames().filter(WC.isFinal).length;
  const roundName = sfDone === 2 ? 'Finals' : qfDone === 4 ? 'Semifinals' : 'Quarterfinals';
  const finalGame = WC.getFinalGame();
  const finalConfirmed = finalGame.ho && finalGame.ao && !finalGame.h.startsWith('Winner ') && !finalGame.a.startsWith('Winner ');

  WC.$('stamp').textContent = WC.state.lastRefresh === 'Never' ? 'World Cup: not refreshed yet' : `World Cup updated: ${WC.state.lastRefresh}`;
  WC.$('recap').innerHTML = finalConfirmed ? `✅ ${WC.currentRoundRecap()}<br>💰 Winner: $${WC.FIRST_PRIZE.toLocaleString()}<br>🥈 Runner-up: $${WC.SECOND_PRIZE.toLocaleString()}<br>🏆 ${finalGame.ho} (${finalGame.h}) vs ${finalGame.ao} (${finalGame.a})` : `✅ ${WC.currentRoundRecap()}<br>🔁 Takeovers: ${takeovers.length}<br>👥 Teams Remaining: ${WC.getAlive().length}<br>🏆 Leader: <b>${leader.o}</b> ${leader.p.toFixed(1)}%`;
  WC.$('insights').innerHTML = `⚽ Alive teams: <b>${WC.getAlive().length}</b><br>🚫 Eliminated shown: <b>${eliminatedCount}</b>`;
  WC.$('top').innerHTML = `<div class="card round-card"><span>Current Round</span><div class="big">⚽ ${roundName}</div></div><div class="card round-card"><span>Takeovers</span><div class="big">🔁 ${takeovers.length}</div></div>`;
  WC.renderTakeoverHistory(takeovers);
  WC.renderChampionshipProbability(rows, takeovers);
  WC.renderOwnerCards(cards, takeovers);
  WC.renderRound16();
  WC.renderQuarterfinals();
  WC.renderSemifinals();
  WC.renderFinal();
  WC.renderBronze();
};