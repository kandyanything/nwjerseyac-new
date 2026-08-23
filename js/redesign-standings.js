// Conference standings: NJ.com publishes the NJAC tables, so each sport links
// out to theirs rather than duplicating the data here.
document.addEventListener('DOMContentLoaded', function () {
    var section = document.querySelector('.njac-standings');
    if (!section) return;

    var wrap = section.querySelector('.standings-groups');
    var note = section.querySelector('.standings-season');
    if (!wrap) return;

    fetch('data/standings.json')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (data) {
            var seasons = (data.seasons || []).filter(function (s) { return s.sports && s.sports.length; });
            if (!seasons.length) { section.style.display = 'none'; return; }
            if (note && data.defaultSeason) note.textContent = data.defaultSeason.replace('-', '–') + ' season';

            seasons.forEach(function (s) {
                var group = document.createElement('div');
                group.className = 'standings-group';

                var h3 = document.createElement('h3');
                h3.textContent = s.name;
                group.appendChild(h3);

                var list = document.createElement('div');
                list.className = 'standings-links';
                s.sports.forEach(function (sp) {
                    var a = document.createElement('a');
                    a.className = 'standings-link';
                    a.href = data.baseUrl + '/' + sp.slug + '/standings/season/' +
                             (sp.season || data.defaultSeason) + '?conference=NJAC';
                    a.target = '_blank';
                    a.rel = 'noopener';
                    a.textContent = sp.label;
                    list.appendChild(a);
                });
                group.appendChild(list);
                wrap.appendChild(group);
            });
        })
        .catch(function () { section.style.display = 'none'; });
});
