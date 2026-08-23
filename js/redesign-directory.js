// Athletic director directory. Renders a card per school that has an AD filled
// in, with a live filter box. Schools with no AD yet are skipped, and the whole
// section stays hidden until at least one is entered, so the directory can be
// completed a few schools at a time without leaving gaps on the page.
document.addEventListener('DOMContentLoaded', function () {
    var section = document.querySelector('.njac-directory');
    if (!section) return;

    var grid = section.querySelector('.directory-grid');
    var filter = section.querySelector('.directory-filter');
    var count = section.querySelector('.directory-count');
    if (!grid) return;

    fetch('data/directory.json')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (data) {
            var all = (data.directory || []).filter(function (d) { return d && d.school; });
            var filled = all.filter(function (d) { return d.ad && d.ad.trim(); });

            if (!filled.length) { section.style.display = 'none'; return; }

            filled.forEach(function (d) { grid.appendChild(buildCard(d)); });
            report(filled.length, all.length);

            if (filter) {
                filter.addEventListener('input', function () {
                    var q = filter.value.trim().toLowerCase();
                    var shown = 0;
                    Array.prototype.forEach.call(grid.children, function (card) {
                        var hit = !q || card.dataset.search.indexOf(q) !== -1;
                        card.hidden = !hit;
                        if (hit) shown++;
                    });
                    if (count) {
                        count.textContent = q
                            ? shown + ' of ' + filled.length + ' schools'
                            : baseLabel(filled.length, all.length);
                    }
                });
            }
        })
        .catch(function () { section.style.display = 'none'; });

    function baseLabel(filled, total) {
        return filled === total
            ? total + ' schools'
            : filled + ' of ' + total + ' schools listed';
    }

    function report(filled, total) {
        if (count) count.textContent = baseLabel(filled, total);
    }

    function buildCard(d) {
        var card = document.createElement('article');
        card.className = 'directory-card';
        card.dataset.search = [d.school, d.ad, d.email].join(' ').toLowerCase();

        if (d.logo) {
            var img = document.createElement('img');
            img.className = 'directory-logo';
            img.src = 'images/logos/optimized/' + d.logo;
            img.alt = '';
            img.loading = 'lazy';
            img.onerror = function () { this.style.display = 'none'; };
            card.appendChild(img);
        }

        var body = document.createElement('div');
        body.className = 'directory-body';

        var h3 = document.createElement('h3');
        if (d.website) {
            var a = document.createElement('a');
            a.href = d.website;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = d.school;
            h3.appendChild(a);
        } else {
            h3.textContent = d.school;
        }
        body.appendChild(h3);

        var ad = document.createElement('p');
        ad.className = 'directory-ad';
        ad.textContent = d.ad;
        body.appendChild(ad);

        var lines = document.createElement('p');
        lines.className = 'directory-contact';
        if (d.email) {
            var mail = document.createElement('a');
            mail.href = 'mailto:' + d.email;
            mail.textContent = d.email;
            lines.appendChild(mail);
        }
        if (d.email && d.phone) lines.appendChild(document.createElement('br'));
        if (d.phone) {
            var tel = document.createElement('a');
            tel.href = 'tel:' + d.phone.replace(/[^0-9+]/g, '');
            tel.textContent = d.phone;
            lines.appendChild(tel);
        }
        if (lines.childNodes.length) body.appendChild(lines);

        card.appendChild(body);
        return card;
    }
});
