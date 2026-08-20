// NJAC News - list of stories with optional thumbnail, headline, date and excerpt.
// The section hides itself when there is nothing to show, so an empty news.json
// leaves no empty heading on the page.
document.addEventListener('DOMContentLoaded', function() {
    const section = document.querySelector('.njac-news');
    if (!section) return;

    const list = section.querySelector('.news-list');

    fetch('data/news.json')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
            const items = (data.news || []).filter(n => n && n.title);
            if (!items.length) { section.style.display = 'none'; return; }
            items.forEach(n => list.appendChild(buildItem(n)));
        })
        .catch(() => { section.style.display = 'none'; });

    function buildItem(n) {
        const item = document.createElement('article');
        item.className = 'news-item';

        if (n.image) {
            const img = document.createElement('img');
            img.className = 'news-thumb';
            img.src = n.image;
            img.alt = n.title;
            img.loading = 'lazy';
            img.onerror = function() { this.style.display = 'none'; };
            item.appendChild(img);
        }

        const body = document.createElement('div');
        body.className = 'news-body';

        const h3 = document.createElement('h3');
        if (n.url) {
            const a = document.createElement('a');
            a.href = n.url;
            a.textContent = n.title;
            if (/^https?:\/\//i.test(n.url)) { a.target = '_blank'; a.rel = 'noopener'; }
            h3.appendChild(a);
        } else {
            h3.textContent = n.title;
        }
        body.appendChild(h3);

        if (n.date) {
            const d = document.createElement('p');
            d.className = 'news-date';
            d.textContent = formatDate(n.date);
            body.appendChild(d);
        }
        if (n.excerpt) {
            const p = document.createElement('p');
            p.className = 'news-excerpt';
            p.textContent = n.excerpt;
            body.appendChild(p);
        }

        item.appendChild(body);
        return item;
    }

    function formatDate(iso) {
        const d = new Date(iso + 'T12:00:00');
        if (isNaN(d)) return iso;
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
});
