// Build data/schedule.json - every NJAC game we can reach, sorted by date then
// time, de-duplicated so a fixture listed by both schools appears once.
//
// Run: node scripts/build-schedule.js [startDate] [endDate]
// Dates are M/D-tolerant strings in the form YYYY-M-D.
//
// Covers the 11 ArbiterLive schools and the 26 on DigitalSports. Morristown-
// Beard (Google Calendar) and Delbarton (own site) are still to come; the
// output shape is source-agnostic so they slot in beside these.

const fs = require('fs');
const path = require('path');
const arbiter = require('./sources/arbiter');
const digitalsports = require('./sources/digitalsports');
const DS_SCHOOLS = require('./ds-schools.json');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'schedule.json');
const PAUSE_MS = 1200;          // be a good citizen: one school at a time

const ARBITER_SCHOOLS = [
    { entityId: 100, name: 'Academy of Saint Elizabeth' },
    { entityId: 2189, name: 'Boonton High School' },
    { entityId: 13538, name: 'Madison High School' },
    { entityId: 15106, name: 'Montville High School' },
    { entityId: 15182, name: 'Morris Catholic High School' },
    { entityId: 15188, name: 'Morris Hills High School' },
    { entityId: 15189, name: 'Morris Knolls High School' },
    { entityId: 17870, name: 'Pequannock High School' },
    { entityId: 18382, name: 'Pope John XXIII High School' },
    { entityId: 25317, name: 'West Morris Central' },
    { entityId: 14434, name: 'West Morris Mendham' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

// A single network blip should not drop a whole school from the calendar -
// Randolph failed once with "fetch failed" and succeeded immediately after.
async function withRetry(label, fn, attempts = 3) {
    let last;
    for (let i = 1; i <= attempts; i++) {
        try { return await fn(); } catch (err) {
            last = err;
            if (i < attempts) {
                console.log(`         retry ${i}/${attempts - 1} for ${label}: ${err.message}`);
                await sleep(2500 * i);
            }
        }
    }
    throw last;
}

function defaultRange() {
    // the school year the season is currently in: Aug 1 through Jul 31
    const now = new Date();
    const y = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    return [`${y}-8-1`, `${y + 1}-7-31`];
}

// A fixture listed by both schools is one game. Prefer the richer record -
// the one that knows whether it is home, and names an opponent.
function score(e) {
    return (e.home !== null ? 2 : 0) + (e.opponent ? 1 : 0) + (e.time ? 1 : 0);
}

// Reduce a school name to its distinguishing word so "Morris Hills High School"
// and "Morris Hills HS" compare equal.
function norm(s) {
    return String(s || '')
        .toLowerCase()
        .replace(/\b(high school|high|school|township|regional|academy|hs)\b/g, '')
        .replace(/[^a-z]/g, '');
}

function merge(target, e) {
    if (!target.schools.includes(e.school)) target.schools.push(e.school);
    return score(e) > score(target) ? { ...e, schools: target.schools } : target;
}

function dedupe(events) {
    // Pass 1: the shared ArbiterLive game id, which covers most of it.
    const byId = new Map();
    for (const e of events) {
        const prev = byId.get(e.id);
        byId.set(e.id, prev ? merge(prev, e) : { ...e, schools: [e.school] });
    }

    // Pass 2: a handful of fixtures carry a different id at each school - a
    // reschedule, or separately entered. The same two schools meeting in the
    // same sport, level and gender at the same moment is one game, so match on
    // that instead. The school pair is sorted, so home and away agree.
    const byFixture = new Map();
    const out = [];
    for (const e of byId.values()) {
        const pair = [norm(e.school), norm(e.opponent)].sort().join('~');
        const key = [e.date, e.time, norm(e.sport), norm(e.level), norm(e.gender), pair].join('|');
        if (!e.opponent || !e.time) { out.push(e); continue; }   // too thin to match safely
        const prev = byFixture.get(key);
        if (prev) { byFixture.set(key, merge(prev, e)); continue; }
        byFixture.set(key, e);
    }
    return out.concat([...byFixture.values()]);
}

(async () => {
    const [start, end] = process.argv[2] && process.argv[3]
        ? [process.argv[2], process.argv[3]]
        : defaultRange();

    console.log(`range ${start} .. ${end}`);
    const all = [];
    const report = [];

    for (const school of ARBITER_SCHOOLS) {
        try {
            const events = await withRetry(school.name, () => arbiter.fetchSchool(school, start, end));
            all.push(...events);
            report.push({ school: school.name, source: 'arbiterlive', games: events.length, ok: events.length > 0 });
            console.log(`  ${String(events.length).padStart(4)} games  ${school.name}`);
        } catch (err) {
            report.push({ school: school.name, source: 'arbiterlive', games: 0, ok: false, error: err.message });
            console.log(`  FAILED         ${school.name}: ${err.message}`);
        }
        await sleep(PAUSE_MS);
    }

    for (const school of DS_SCHOOLS) {
        try {
            const events = await withRetry(school.name, () => digitalsports.fetchSchool(school, start, end, { pauseMs: 600 }));
            all.push(...events);
            report.push({ school: school.name, source: 'digitalsports', games: events.length, ok: events.length > 0 });
            console.log(`  ${String(events.length).padStart(4)} games  ${school.name}`);
        } catch (err) {
            report.push({ school: school.name, source: 'digitalsports', games: 0, ok: false, error: err.message });
            console.log(`  FAILED         ${school.name}: ${err.message}`);
        }
        await sleep(PAUSE_MS);
    }

    const games = dedupe(all).sort((a, b) =>
        a.date === b.date ? (a.time || '').localeCompare(b.time || '') : a.date.localeCompare(b.date));

    const byDate = {};
    for (const g of games) (byDate[g.date] = byDate[g.date] || []).push(g);

    // A school that returns nothing is far more likely to be a broken fetch than
    // a school with no games all year, so surface it rather than silently
    // publishing a thinner calendar.
    const empty = report.filter(r => !r.ok);

    fs.writeFileSync(OUT, JSON.stringify({
        _comment: 'Generated by scripts/build-schedule.js - do not edit by hand. Covers 37 of the 39 member schools; Morristown-Beard and Delbarton are not in here yet. Games only - practices and scrimmages are filtered out. Sorted by date then start time, de-duplicated so a fixture listed by both schools appears once. Cancelled games are kept and carry status.',
        generated: new Date().toISOString(),
        range: { start, end },
        sources: report,
        coverage: { schoolsFetched: report.length, schoolsInConference: 39, complete: report.length >= 37 },
        counts: { raw: all.length, deduped: games.length, dates: Object.keys(byDate).length },
        games,
    }, null, 2) + '\n');

    console.log(`\n  raw ${all.length} -> ${games.length} after de-duplication`);
    console.log(`  ${Object.keys(byDate).length} dates covered`);
    console.log(`  written ${path.relative(ROOT, OUT)}`);
    if (empty.length) {
        console.log(`\n  WARNING - ${empty.length} source(s) returned nothing:`);
        empty.forEach(r => console.log(`    ${r.school}${r.error ? ' - ' + r.error : ''}`));
    }
})().catch(e => { console.error('FAILED:', e); process.exit(1); });
