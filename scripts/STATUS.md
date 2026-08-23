# NJAC site — working status

Written so nothing important depends on chat history. Update or delete freely.

## Live site

Everything below is on `main` and deployed. Redesigned site: home page plus
`videos.html`, and the five interior pages sharing one shell and design system.

Home page sections, all data-driven from `data/`:

| Section | Data file | State |
|---|---|---|
| Hero photo slider | `slides.json` | **empty — dormant**, hero shows plain gradient |
| NJAC Vision | `videos.json` | 10 games, feature + 6, rest on `videos.html` |
| NJAC News | `news.json` | **empty — section hidden** |
| Standings | `standings.json` | 23 sports, all linked |
| Individual School Schedules | in-page markup | 39 logo tiles |
| NJAC Leadership | `leadership.json` | 5 officers, name + position only |
| Athletic Directors | `directory.json` | 39 schools |
| Honors | `honors.json` | **empty — section hidden** |

Every one of these hides itself when its file is empty, so nothing needs
markup changes when content arrives.

## Waiting on content

- **Hero photos** — landscape, ~2000x800 or wider. The three files in
  `images/photos/` are portrait Randolph social graphics and are not usable.
- **News stories** — title, date, image, url, excerpt.
- **Honors** — championships, scholar athletes.

## Open questions

- **Morristown AD**: the conference list names two people (Smitty Horton and
  David Doty) at the same number. Horton is used; unconfirmed which is correct.
- **AD list is dated 9/20/24** — nearly two years old.
- **NJAC Leadership sits under the Standings menu**; Athletic Directors was
  moved to Conference. Leadership arguably belongs there too.
- **Dover's logo has a black box** baked into the artwork. Same class of
  problem as Vernon's white plate, but removing black risks eating the tiger.
- **Winter and Spring standings** point at 2026-2027 NJ.com pages that stay
  empty until those seasons start. Fencing and lacrosse carry a `season`
  override of 2025-2026; delete it once NJ.com posts the new tables.
- **NJAC logo is only 214x213**. A vector or 1000px+ source would let it run
  larger and sharper.

## Schedule aggregation (`scripts/`)

Not yet wired into any page. `node scripts/build-schedule.js` writes
`data/schedule.json`.

All 39 schools are reachable across three sources:

- **ArbiterLive (11)** — `POST /School/GetEventsByEntity/` with a date range,
  after seeding a session on that school's calendar page. Undocumented.
  `uniqueGameId` is null on every record; the game id inside the event `url`
  is the one shared between both schools in a fixture.
- **DigitalSports (26)** — `POST /pages/schedule/schedule-json.php`.
  Honours **one month per request**; a longer range silently returns part of
  the first month rather than erroring. `entityId` is discovered from each
  school's own schedule page.
- **iCal (2)** — Delbarton (Sidearm) and Morristown-Beard (Google Calendar).

Athletic events only. DigitalSports marks entries `[H]` home, `[A]` away,
`[S]` scrimmage, `[P]` practice, `[T]` transport, `[TE]` team event, `[FE]`
facility event, `[SE]` school event. Only `H` and `A` are kept — an allow-list,
so an unfamiliar marker is excluded rather than leaking through. Marching band
and similar travelling non-athletic activities are filtered in the builder.

De-duplication runs twice: on the shared game id, then on date, time, sport,
level, gender and the sorted school pair. Measured on the previous full run:
**zero true duplicates**, with ~56 near-misses caused by two sources naming a
sport differently.

### Before this goes on the site

- `schedule.json` was **4.3 MB** at 37 schools. Too large to send to every
  visitor — split by month before building the calendar UI.
- Needs a scheduled rebuild (Netlify scheduled function) rather than manual runs.
- A school returning zero games is treated as a failure and reported, not
  published as an empty schedule. Keep that behaviour.

## Local preview

    node <scratchpad>/serve.js "" 8900     # then http://127.0.0.1:8900/

`fetch` will not work from `file://`, so the data-driven sections need a server.

---

# Dead ends — things that look like they work but don't

Recorded because each one cost time and would be rediscovered the same way.

**`200 OK` is not evidence of data.** This bit repeatedly, in five places:

- ArbiterLive `/Feed/Calendar/{id}` and `/School/CalendarFeed/{id}` — 200, **zero bytes**
- Sidearm `/services/responsive-calendar.ashx` — 200, zero bytes with every
  parameter combination tried, session or not
- DigitalSports with a multi-month range — 200, but silently returns *part of
  the first month* rather than erroring
- NJ.com standings for cross country, fencing, lacrosse and football — 200,
  but the table is empty; NJAC is not a published grouping for those sports
- NJ.com serves a 200 for all 37 of its sport slugs regardless

Always check the body, and prefer a content assertion (row count, a known
school name) over a status code.

**WebFetch does not execute JavaScript.** It reads rendered text. Anything
loaded client-side is invisible to it. This produced a wrong conclusion about
the reference site's hero slider, and hid MCADA's video carousel. For any
JS-heavy page, fetch the raw HTML and read the markup or the JS bundle instead.

**`getent hosts` silently fails on this machine** — it reports "no record" for
google.com. Every DNS conclusion drawn from it was void. Use PowerShell
`Resolve-DnsName`, and always include a known-good control in the batch.

**Sucuri (DigitalSports' WAF) returns 307 to everything**, including a
deliberately fake subdomain. A 307 there means "bot blocked", not "site
exists" — it cannot distinguish real from invented. It is also *transient*:
rapid parallel probing triggers it, but polite sequential requests get through
fine. An early conclusion that DigitalSports was permanently unscrapeable was
wrong and nearly cost the whole aggregation.

**remove.bg destroys logos with enclosed white.** It is built for photographs.
Run on the NJAC seal it stripped the white disc the ring lettering sits on,
leaving the text hollow. Edge-connected flood fill is the right tool: only
white reachable from the border is background.

**White is not always background.** Randolph's R and West Morris Central's WM
carry a white keyline as part of the mark. Removing it hollowed the letters
out. Both were processed, inspected, and reverted.

**`npm install` fails inside the OneDrive folder** — the sync client locks
`node_modules` and npm reports a permissions error. Install build-only tools
in a scratch directory outside OneDrive and run them from there.

**Heredocs in the Bash tool are unreliable for large content**, and shell
escaping mangles regexes and template literals — a `\/Teams\/Game\/(\d+)\//`
became `//Teams/Game/(d+)//`, and two `console.log` template strings were
emptied. Use the Write/Edit tools for anything containing backslashes,
backticks or `${}`.

---

# Corrections — claims that turned out to be wrong

Kept because the pattern matters more than the individual errors.

**The pattern: trusting a signal that resembles verification but isn't.**

- **"`uniqueGameId` is the de-duplication key handed to us."** It is null on
  every record. The field name was read from the schema; the values were never
  checked. Dedup was removing 15 of 3,458 records instead of 420.
- **"The masthead fix is verified."** Verification was `grep masthead-brand`,
  which matched surviving sub-rules while the actual flex block had been eaten
  by an over-greedy regex. The layout stayed broken through a commit that
  claimed to fix it. Assert on the *rule*, not the string.
- **"Duplicate rate is 4.19%."** The detector ignored level, so a JV game and a
  Freshman game between the same schools at the same time counted as a
  duplicate. Measured properly the true rate was **zero**.
- **"Games only."** The filter excluded `[S]` and nothing else, so `[P]`, `[TE]`,
  `[FE]`, `[SE]` and `[T]` entries — practices, club meetings, facility
  bookings, prom, holidays — reached the calendar. ~1,300 non-games.
- **"Delbarton has 60 games."** The opponent matcher recognised `vs`, `@` and
  `v` but not `at`, silently dropping every away fixture. 60 looked healthy;
  the real number was 106. A missing game is invisible, which is exactly what
  makes it dangerous.
- **"Skyland has no hero."** It has a photo slider; WebFetch could not see it.
- **"41 rows for 39 schools."** The count included the table header row.
- **"Sussex Tech: keep the site's URL, the JSON is stale."** That call was made
  when neither could be checked. Once checkable, the site's URL 502'd across
  the whole subdomain and the JSON was right.

**Working rule that came out of this:** a check that cannot fail is not a
check. Include a control, assert on content, and prefer counting the thing
itself over counting a proxy for it.
