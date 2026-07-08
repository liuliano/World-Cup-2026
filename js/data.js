window.WC = window.WC || {};

WC.rankings = {
  Argentina: 1, Brazil: 2, France: 3, Spain: 4, England: 5, Portugal: 6,
  Belgium: 9, Colombia: 10, Switzerland: 11, 'United States': 12,
  Mexico: 13, Morocco: 16, Norway: 17, Egypt: 23, Paraguay: 25, Canada: 27
};

WC.strength = {
  Argentina: 96, Brazil: 94, France: 93, Spain: 92, England: 90, Portugal: 88,
  Belgium: 82, Colombia: 80, Switzerland: 78, 'United States': 76,
  Mexico: 75, Morocco: 72, Norway: 71, Egypt: 65, Paraguay: 63, Canada: 61
};

WC.baseTakeovers = [
  ['England', 'Joe', 'McCartney', 'England -1.5 | DR Congo +1.5', 'England 2-1', 'DR Congo covered. McCartney took over England.'],
  ['Belgium', 'J. Schwartz', 'Dolan', 'Belgium -0.5 | Senegal +0.5', 'Belgium 3-2 AET', 'Senegal covered. Dolan took over Belgium.'],
  ['Argentina', 'McCartney', 'J. Schwartz', 'Argentina -2.5 | Cape Verde +2.5', 'Argentina 3-2', 'Cape Verde covered. J. Schwartz took over Argentina.']
];

WC.ownerHistory = {
  Baxter: ['Canada', 'Colombia'],
  Nolan: ['Morocco'],
  Whelan: ['Paraguay', 'Spain', 'France'],
  Knox: ['France', 'Norway'],
  Gal: ['Brazil'],
  Merc: ['Mexico', 'United States'],
  McCartney: ['England'],
  Roynan: ['Portugal'],
  Dolan: ['Belgium'],
  'J. Schwartz': ['Argentina'],
  Joe: ['Egypt', 'Argentina'],
  'E. Schwartz': ['Switzerland']
};

WC.round16Games = [
  { h: 'Canada', ho: 'Baxter', a: 'Morocco', ao: 'Nolan', line: -0.5, hs: 0, as: 3, date: 'Jul 4, 1:00 PM', venue: 'NRG Stadium — Houston, Texas' },
  { h: 'Paraguay', ho: 'Whelan', a: 'France', ao: 'Knox', line: 1.5, hs: 0, as: 1, date: 'Jul 4, 5:00 PM', venue: 'Lincoln Financial Field — Philadelphia, Pennsylvania' },
  { h: 'Brazil', ho: 'Gal', a: 'Norway', ao: 'Knox', line: -0.5, hs: 1, as: 2, date: 'Jul 5, 4:00 PM', venue: 'MetLife Stadium — East Rutherford, New Jersey' },
  { h: 'Mexico', ho: 'Merc', a: 'England', ao: 'McCartney', line: 0, hs: 0, as: 2, date: 'Jul 5, 8:00 PM', venue: 'AT&T Stadium — Arlington, Texas' },
  { h: 'Spain', ho: 'Whelan', a: 'Portugal', ao: 'Roynan', line: 0.5, hs: 2, as: 1, date: 'Jul 6, 3:00 PM', venue: 'Hard Rock Stadium — Miami, Florida' },
  { h: 'United States', ho: 'Merc', a: 'Belgium', ao: 'Dolan', line: 0, hs: 1, as: 4, date: 'Jul 6, 8:00 PM', venue: 'Lumen Field — Seattle, Washington' },
  { h: 'Argentina', ho: 'J. Schwartz', a: 'Egypt', ao: 'Joe', line: -1.5, hs: 3, as: 2, date: 'Jul 7, 12:00 PM', venue: 'Mercedes-Benz Stadium — Atlanta, Georgia' },
  { h: 'Switzerland', ho: 'E. Schwartz', a: 'Colombia', ao: 'Baxter', line: 0.5, hs: 3, as: 1, date: 'Jul 7, 4:00 PM', venue: 'BC Place — Vancouver' }
];

WC.qfGames = [
  { h: 'France', ho: 'Whelan', a: 'Morocco', ao: 'Nolan', line: -0.5, hs: null, as: null, date: 'Jul 9, 4:00 PM', venue: 'NRG Stadium — Houston, Texas' },
  { h: 'Spain', ho: 'Whelan', a: 'Belgium', ao: 'Dolan', line: -0.5, hs: null, as: null, date: 'Jul 10, 3:00 PM', venue: 'Lincoln Financial Field — Philadelphia, Pennsylvania' },
  { h: 'England', ho: 'McCartney', a: 'Norway', ao: 'Knox', line: -0.5, hs: null, as: null, date: 'Jul 11, 5:00 PM', venue: 'MetLife Stadium — East Rutherford, New Jersey' },
  { h: 'Argentina', ho: 'Joe', a: 'Switzerland', ao: 'E. Schwartz', line: -0.5, hs: null, as: null, date: 'Jul 11, 9:00 PM', venue: 'TBD' }
];

WC.state = {
  lastRefresh: localStorage.wc_last_espn || 'Never',
  previousOdds: JSON.parse(localStorage.wc_previous_odds || '[]')
};