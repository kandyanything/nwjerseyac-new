// Hero photo slider. Photos cross-fade behind the hero text.
//
// If slides.json is empty the hero keeps its plain gradient, so the page never
// shows an empty banner while photos are still being gathered.
document.addEventListener('DOMContentLoaded', function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    fetch('data/slides.json')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (data) {
            var slides = (data.slides || []).filter(function (s) { return s && s.image; });
            if (!slides.length) return;                 // keep the gradient hero
            build(slides, data.intervalMs || 6000);
        })
        .catch(function () { /* gradient hero stands */ });

    function build(slides, interval) {
        hero.classList.add('hero--photo');

        var layer = document.createElement('div');
        layer.className = 'hero-slides';
        layer.setAttribute('aria-hidden', 'true');

        slides.forEach(function (s, i) {
            var fig = document.createElement('div');
            fig.className = 'hero-slide' + (i === 0 ? ' is-active' : '');
            var img = document.createElement('img');
            img.src = s.image;
            img.alt = s.alt || '';
            img.loading = i === 0 ? 'eager' : 'lazy';
            fig.appendChild(img);
            layer.appendChild(fig);
        });
        hero.insertBefore(layer, hero.firstChild);

        var caption = document.createElement('div');
        caption.className = 'hero-caption';
        hero.appendChild(caption);

        var controls = document.createElement('div');
        controls.className = 'hero-controls';
        var prev = mkBtn('‹', 'Previous slide');
        var dots = document.createElement('div');
        dots.className = 'hero-dots';
        var next = mkBtn('›', 'Next slide');
        controls.appendChild(prev);
        controls.appendChild(dots);
        controls.appendChild(next);
        hero.appendChild(controls);

        slides.forEach(function (s, i) {
            var d = document.createElement('button');
            d.type = 'button';
            d.className = 'hero-dot' + (i === 0 ? ' is-active' : '');
            d.setAttribute('aria-label', 'Slide ' + (i + 1));
            d.addEventListener('click', function () { go(i, true); });
            dots.appendChild(d);
        });

        var idx = 0, timer = null;
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function render() {
            var figs = layer.children, ds = dots.children;
            for (var i = 0; i < figs.length; i++) figs[i].classList.toggle('is-active', i === idx);
            for (var j = 0; j < ds.length; j++) ds[j].classList.toggle('is-active', j === idx);

            var s = slides[idx];
            caption.innerHTML = '';
            if (s.heading || s.text || s.link) {
                if (s.heading) {
                    var h = document.createElement('h2');
                    h.textContent = s.heading;
                    caption.appendChild(h);
                }
                if (s.text) {
                    var p = document.createElement('p');
                    p.textContent = s.text;
                    caption.appendChild(p);
                }
                if (s.link) {
                    var a = document.createElement('a');
                    a.className = 'btn';
                    a.href = s.link;
                    a.textContent = s.linkLabel || 'Read More';
                    if (/^https?:\/\//i.test(s.link)) { a.target = '_blank'; a.rel = 'noopener'; }
                    caption.appendChild(a);
                }
                caption.hidden = false;
            } else {
                caption.hidden = true;
            }
        }

        function go(n, manual) {
            idx = (n + slides.length) % slides.length;
            render();
            if (manual) restart();
        }

        function restart() {
            if (timer) clearInterval(timer);
            if (reduce || slides.length < 2) return;
            timer = setInterval(function () { go(idx + 1); }, interval);
        }

        prev.addEventListener('click', function () { go(idx - 1, true); });
        next.addEventListener('click', function () { go(idx + 1, true); });
        hero.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
        hero.addEventListener('mouseleave', restart);

        if (slides.length < 2) controls.hidden = true;
        render();
        restart();
    }

    function mkBtn(glyph, label) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'hero-arrow';
        b.textContent = glyph;
        b.setAttribute('aria-label', label);
        return b;
    }
});
