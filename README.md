# World Cup 2026 Takeover Pool

GitHub Pages app for tracking a World Cup takeover pool.

## Files

- `index.html` - current live app used by GitHub Pages.
- `styles.css` - modular stylesheet.
- `data.js` - owner, team, ranking, and normalization data.
- `lines.js` - locked matchup lines and ESPN endpoint.
- `odds.js` - compatibility wrapper for line exports.
- `bracket.js` - bracket rendering module.
- `montecarlo.js` - Monte Carlo simulation module.
- `app.js` - staged application controller module.

## Workflow

No manual file editing is required by the pool owner.

Send the locked lines or a screenshot to ChatGPT and ask it to update and commit the repository.

Example:

`Update Round of 16 lines and commit`

The live site is still served by `index.html` while the modular files are staged and tested.
