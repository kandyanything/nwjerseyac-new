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
