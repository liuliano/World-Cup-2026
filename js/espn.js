window.WC = window.WC || {};

WC.refreshFromEspn = async function refreshFromEspn() {
  const status = WC.$('status');
  status.textContent = 'Refreshing ESPN and recalculating...';

  try {
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260709-20260711&limit=100&_=${Date.now()}`);
    if (!response.ok) throw new Error(`ESPN returned ${response.status}`);

    const data = await response.json();
    let matched = 0;

    (data.events || []).forEach((event) => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors || [];
      if (competitors.length < 2) return;

      const home = competitors.find((team) => team.homeAway === 'home') || competitors[0];
      const away = competitors.find((team) => team.homeAway === 'away') || competitors[1];
      const eventStatus = competition?.status || event.status || {};
      const statusType = eventStatus.type || {};
      const isComplete = statusType.completed === true;
      const isInProgress = statusType.state === 'in' || statusType.name === 'STATUS_IN_PROGRESS';
      const displayStatus = statusType.shortDetail || statusType.detail || statusType.description || (isComplete ? 'Final' : isInProgress ? 'Live' : 'Scheduled');

      WC.qfGames.forEach((game) => {
        const direct = WC.norm(game.h) === WC.norm(home.team.displayName) && WC.norm(game.a) === WC.norm(away.team.displayName);
        const reverse = WC.norm(game.h) === WC.norm(away.team.displayName) && WC.norm(game.a) === WC.norm(home.team.displayName);
        if (!direct && !reverse) return;

        const gameHome = direct ? home : away;
        const gameAway = direct ? away : home;

        game.status = isComplete ? 'Final' : displayStatus;
        game.final = isComplete;

        if (isComplete || isInProgress) {
          game.hs = gameHome.score === '' ? null : Number(gameHome.score);
          game.as = gameAway.score === '' ? null : Number(gameAway.score);
        } else {
          game.hs = null;
          game.as = null;
        }

        matched += 1;
      });
    });

    WC.state.lastRefresh = `${new Date().toLocaleString()} (${matched} QF games matched)`;
    WC.state.previousOdds = WC.simulateTournament();

    localStorage.wc_last_espn = WC.state.lastRefresh;
    localStorage.wc_previous_odds = JSON.stringify(WC.state.previousOdds);
    localStorage.wc_qf_games = JSON.stringify(WC.qfGames.map((game) => ({
      hs: game.hs,
      as: game.as,
      status: game.status || 'Scheduled',
      final: game.final === true
    })));

    WC.renderDashboard();
    status.textContent = 'ESPN refresh complete. Results saved.';
  } catch (error) {
    status.textContent = `ESPN failed: ${error.message}`;
  }
};