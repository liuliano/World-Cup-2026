window.WC = window.WC || {};

WC.formatEspnDate = function formatEspnDate(isoDate) {
  if (!isoDate) return 'TBD';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(new Date(isoDate));
};

WC.refreshFromEspn = async function refreshFromEspn() {
  const status = WC.$('status');
  status.textContent = 'Refreshing ESPN schedule, locations, results, and pool odds...';

  try {
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260709-20260719&limit=100&_=${Date.now()}`);
    if (!response.ok) throw new Error(`ESPN returned ${response.status}`);

    const data = await response.json();
    let matched = 0;
    const knockoutEvents = [];

    (data.events || []).forEach((event) => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors || [];
      const statusType = (competition?.status || event.status || {}).type || {};
      const isComplete = statusType.completed === true;
      const isInProgress = statusType.state === 'in' || statusType.name === 'STATUS_IN_PROGRESS';
      const displayStatus = statusType.shortDetail || statusType.detail || statusType.description || (isComplete ? 'Final' : isInProgress ? 'Live' : 'Scheduled');
      const venue = competition?.venue?.fullName || competition?.venue?.address?.city || 'TBD';
      const eventDate = event.date || competition?.date || null;
      const home = competitors.find((team) => team.homeAway === 'home') || competitors[0];
      const away = competitors.find((team) => team.homeAway === 'away') || competitors[1];

      knockoutEvents.push({
        id: event.id,
        dateIso: eventDate,
        date: WC.formatEspnDate(eventDate),
        venue,
        status: isComplete ? 'Final' : displayStatus,
        final: isComplete,
        home: home?.team?.displayName || '',
        away: away?.team?.displayName || '',
        hs: home?.score === '' || home?.score == null ? null : Number(home.score),
        as: away?.score === '' || away?.score == null ? null : Number(away.score)
      });

      if (competitors.length < 2) return;

      WC.qfGames.forEach((game) => {
        const direct = WC.norm(game.h) === WC.norm(home.team.displayName) && WC.norm(game.a) === WC.norm(away.team.displayName);
        const reverse = WC.norm(game.h) === WC.norm(away.team.displayName) && WC.norm(game.a) === WC.norm(home.team.displayName);
        if (!direct && !reverse) return;

        const gameHome = direct ? home : away;
        const gameAway = direct ? away : home;
        game.date = WC.formatEspnDate(eventDate);
        game.venue = venue;
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

    WC.espnKnockoutEvents = knockoutEvents;
    WC.state.lastRefresh = `${new Date().toLocaleString()} (${matched} QF games matched)`;
    WC.state.previousOdds = WC.simulateTournament();

    localStorage.wc_last_espn = WC.state.lastRefresh;
    localStorage.wc_previous_odds = JSON.stringify(WC.state.previousOdds);
    localStorage.wc_espn_knockout_events = JSON.stringify(knockoutEvents);
    localStorage.wc_qf_games = JSON.stringify(WC.qfGames.map((game) => ({
      hs: game.hs,
      as: game.as,
      date: game.date,
      venue: game.venue,
      status: game.status || 'Scheduled',
      final: game.final === true
    })));

    WC.renderDashboard();
    status.textContent = 'ESPN refresh complete. Times, locations, and results saved.';
  } catch (error) {
    status.textContent = `ESPN failed: ${error.message}`;
  }
};