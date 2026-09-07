// NJAC school logo matcher. data/schools.json carries no slug and the logo
// files under images/logos/optimized/ were named by hand, so this maps a team
// name (from the schedule or from NJ.com) to the correct <slug>.png filename.
const fs = require('fs'), path = require('path');
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'schools.json'), 'utf8'));
const LIST = (raw.schools || raw).map(s => s.name);

// schools whose logo filename differs from a plain slugify (see reverse-engineering)
const SLUG = {
    'High Point High School': 'high-point',
    'Jefferson Township High School': 'jefferson',
    'Morris County School of Technology': 'morris-county-school-of-technology',
    'Pope John XXIII High School': 'pope-john',
    'Randolph Township School District': 'randolph',
    'Sussex County Tech High School': 'sussex-county-school-of-technology',
    'Vernon Township High School': 'vernon',
    'Villa Walsh Academy': 'villa-walsh',
    'Delbarton School': 'delbarton',
    'Morristown Beard School': 'morristown-beard',
    'Butler High School': 'butler',
};
function slugify(n) {
    return String(n).toLowerCase().replace(/&/g, ' and ').replace(/[.'’]/g, '')
        .replace(/\bhigh school\b/g, ' ').replace(/\b(regional|the|of)\b/g, ' ')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
// A name reduced to a comparison key; applied identically to the roster names and
// to incoming NJ.com names, so short forms ("Vernon" = "Vernon Township HS") agree.
function norm(n) {
    return String(n).toLowerCase().replace(/&/g, 'and').replace(/\bhigh school\b/g, ' ')
        .replace(/\b(high|school|township|regional|the|of|county|academy|district|xxiii|jr|sr|senior)\b/g, ' ')
        .replace(/[^a-z0-9]/g, '');
}
const BY = {};
for (const nm of LIST) {
    const slug = (nm in SLUG) ? SLUG[nm] : slugify(nm);
    if (slug) BY[norm(nm)] = slug;
}
// NJ.com short-name variants that don't reduce to the same key
const ALIAS = {
    morristech: 'morris-county-school-of-technology',
    morriscountyvocational: 'morris-county-school-of-technology',
    sussextech: 'sussex-county-school-of-technology',
};
function logoSlug(name) { const k = norm(name); return BY[k] || ALIAS[k] || null; }
module.exports = { logoSlug, norm };
