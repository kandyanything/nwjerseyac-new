// NJAC Vision - horizontal strip of game videos.
//
// Each tile is a thumbnail rather than an <iframe>. Ten embedded players would
// pull in the full YouTube player ten times over on page load; the thumbnail is
// a single image, and the real iframe is swapped in only when a tile is clicked.
document.addEventListener('DOMContentLoaded', function() {
    const section = document.querySelector('.njac-vision');
    if (!section) return;

    const track = section.querySelector('.vision-track');
    const prevBtn = section.querySelector('.vision-prev');
    const nextBtn = section.querySelector('.vision-next');

    fetch('data/videos.json')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => {
            const videos = (data.videos || []).filter(v => v && v.id);
            if (!videos.length) { section.style.display = 'none'; return; }
            videos.forEach(v => track.appendChild(buildTile(v)));
            updateArrows();
        })
        .catch(() => { section.style.display = 'none'; });

    function buildTile(v) {
        const tile = document.createElement('article');
        tile.className = 'vision-item';

        const btn = document.createElement('button');
        btn.className = 'vision-thumb';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Play video: ' + (v.title || 'NJAC game'));

        const img = document.createElement('img');
        // "thumb" picks the preview frame:
        //   omitted        -> the uploader's own thumbnail (the matchup graphic)
        //   "hq1|hq2|hq3"  -> YouTube's auto-captured frame from 25/50/75% in
        //   a full URL     -> that image, e.g. a screenshot stored in images/
        // maxresdefault is not generated for every upload, so fall back to
        // hqdefault, which YouTube always produces.
        if (v.thumb && /^https?:\/\//i.test(v.thumb)) {
            img.src = v.thumb;
        } else if (v.thumb) {
            img.src = 'https://i.ytimg.com/vi/' + v.id + '/' + v.thumb + '.jpg';
        } else {
            img.src = 'https://i.ytimg.com/vi/' + v.id + '/maxresdefault.jpg';
            img.onerror = function() {
                this.onerror = null;
                this.src = 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg';
            };
        }
        img.alt = v.title || 'NJAC game video';
        img.loading = 'lazy';
        btn.appendChild(img);

        const play = document.createElement('span');
        play.className = 'vision-play';
        play.setAttribute('aria-hidden', 'true');
        btn.appendChild(play);

        btn.addEventListener('click', () => playInline(btn, v));

        const meta = document.createElement('div');
        meta.className = 'vision-meta';
        const h3 = document.createElement('h3');
        h3.textContent = v.title || 'NJAC game';
        meta.appendChild(h3);
        if (v.date || v.sport) {
            const p = document.createElement('p');
            p.className = 'vision-sub';
            p.textContent = [v.sport, formatDate(v.date)].filter(Boolean).join(' · ');
            meta.appendChild(p);
        }

        tile.appendChild(btn);
        tile.appendChild(meta);
        return tile;
    }

    function playInline(btn, v) {
        const frame = document.createElement('iframe');
        frame.src = 'https://www.youtube.com/embed/' + v.id + '?autoplay=1&rel=0';
        frame.title = v.title || 'NJAC game video';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.allowFullscreen = true;
        frame.setAttribute('frameborder', '0');
        btn.replaceWith(frame);
    }

    function formatDate(iso) {
        if (!iso) return '';
        const d = new Date(iso + 'T12:00:00');
        if (isNaN(d)) return iso;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function scrollByCard(dir) {
        const first = track.querySelector('.vision-item');
        const step = first ? first.getBoundingClientRect().width + 16 : 300;
        track.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
    }

    function updateArrows() {
        const overflowing = track.scrollWidth > track.clientWidth + 4;
        [prevBtn, nextBtn].forEach(b => { if (b) b.hidden = !overflowing; });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollByCard(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollByCard(1));
    window.addEventListener('resize', updateArrows);
});
