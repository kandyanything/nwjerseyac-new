# Scores prototype (not deployed)

An unfinished experiment that scrapes scores and renders them on the page.
Nothing references it: no page loads `js/scores-display.js`, and `data/scores.json`
is a sample rather than live data.

It used to live in `netlify/functions/`, which is Netlify's default functions
directory - Netlify finds anything there automatically and bundles it as a
serverless function during every deploy. `fetch-scores.js` requires `cheerio`,
and `package.json` is deliberately not in git (see `.gitignore`), so the bundle
could not resolve it and the deploy failed. The site silently stopped updating.

Moving the file out of that directory is what makes it inert. If this is ever
finished, it needs both a move back to `netlify/functions/` and a committed
`package.json` listing `cheerio` - and the trade-off noted in `.gitignore`
applies again: a `package.json` at the publish root makes Netlify install
dependencies on every deploy, the nightly schedule push included.
