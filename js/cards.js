window.WC = window.WC || {};

WC.$ = function $(id) {
  return document.getElementById(id);
};

WC.rankBadge = function rankBadge(team) {
  return WC.rankings[team] ? `<span class="rank">#${WC.rankings[team]}</span>` : '';
};

WC.gameCard = function gameCard(game) {
  const result = WC.resolveGame(game);
  return `
    <div class="card">
      <div class="muted">${game.date} · ${WC.isFinal(game) ? 'Final' : 'Scheduled'}<br>📍 ${game.venue}</div>
      <b>${game.h} vs ${game.a}</b>
      <div class="team">
        <span>${game.h} ${WC.rankBadge(game.h)}<span class="owner">${game.ho}</span></span>
        <span><b>${game.hs ?? 0}</b> <span class="${WC.spreadClass(game.line)}">${WC.spreadText(game.line)}</span></span>
      </div>
      <div class="team">
        <span>${game.a} ${WC.rankBadge(game.a)}<span class="owner">${game.ao}</span></span>
        <span><b>${game.as ?? 0}</b> <span class="${WC.spreadClass(-game.line)}">${WC.spreadText(-game.line)}</span></span>
      </div>
      ${result ? `<div class="muted">Winner advances: <b>${result.team}</b> · Owner now: <b>${result.owner}</b></div>` : ''}
    </div>
  `;
};