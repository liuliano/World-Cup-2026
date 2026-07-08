window.WC = window.WC || {};

WC.renderRound16 = function renderRound16() {
  WC.$('r16').innerHTML = WC.round16Games.map(WC.gameCard).join('');
};

WC.renderQuarterfinals = function renderQuarterfinals() {
  WC.$('qf').innerHTML = WC.qfGames.map(WC.gameCard).join('');
};

WC.renderSemifinals = function renderSemifinals() {
  WC.$('sf').innerHTML = WC.getSemifinalGames().map(WC.gameCard).join('');
};

WC.renderFinal = function renderFinal() {
  WC.$('finals').innerHTML = WC.gameCard(WC.getFinalGame());
};

WC.renderTakeoverHistory = function renderTakeoverHistory(takeovers) {
  WC.$('history').innerHTML = takeovers
    .map((event) => `
      <div class="card take">
        <b>🔁 ${event[0]}</b><br>
        ${event[1]} → <b>${event[2]}</b><br>
        <b>Spread:</b> ${event[3]}<br>
        <b>Final:</b> ${event[4]}<br>
        <b>Reason:</b> ${event[5]}
      </div>
    `)
    .join('');
};

WC.renderChampionshipProbability = function renderChampionshipProbability(rows, takeovers) {
  WC.$('odds').innerHTML = `
    <table>
      <tr><th>Rank</th><th>Owner</th><th>Odds</th><th>Move</th><th>Teams</th></tr>
      ${rows.map((row, index) => `
        <tr>
          <td>#${index + 1}</td>
          <td><b>${row.o}</b></td>
          <td><b>${row.p.toFixed(1)}%</b><div class="bar"><div class="fill" style="width:${row.p}%"></div></div></td>
          <td>${WC.oddsMove(row.o, row.p)}</td>
          <td>${row.teams.map((team) => `<span class="badge">${takeovers.some((x) => x[0] === team) ? '🔁 ' : ''}${team}</span>`).join('')}</td>
        </tr>
      `).join('')}
    </table>
  `;
};

WC.renderOwnerCards = function renderOwnerCards(cards, takeovers) {
  WC.$('owners').innerHTML = Object.entries(cards)
    .sort()
    .map(([owner, value]) => `
      <div class="card">
        <b>${owner}</b><br>
        ${value.live.map((team) => `<span class="badge">${takeovers.some((x) => x[0] === team) ? '🔁 ' : ''}${team}</span>`).join('')}
        ${value.out.map((team) => `<span class="badge elim">${team} ❌</span>`).join('')}
      </div>
    `)
    .join('');
};

WC.renderDashboard = function renderDashboard() {
  const rows = WC.simulateTournament();
  const takeovers = WC.getTakeovers();
  const cards = WC.getOwnerCards();
  const eliminatedCount = Object.values(cards).reduce((total, card) => total + card.out.length, 0);
  const leader = rows[0];

  WC.$('stamp').textContent = WC.state.lastRefresh === 'Never'
    ? 'World Cup: not refreshed yet'
    : `World Cup updated: ${WC.state.lastRefresh}`;

  WC.$('recap').innerHTML = `✔ ${WC.round16Games.filter(WC.isFinal).length} Round of 16 finals<br>🔁 ${takeovers.length} takeovers<br>🏆 Leader: <b>${leader.o}</b> ${leader.p.toFixed(1)}%`;
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