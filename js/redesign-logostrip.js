// School logos drifting right to left behind the masthead.
//
// The illusion is that the logos pass *behind* the NJAC seal and the wordmark:
// they fade out as they reach the end of "Conference", cross the brand unseen,
// and reappear in the gap to the left of the seal before fading off the edge.
//
// That is done with a mask on the marquee layer rather than by hiding anything.
// The mask stops depend on where the brand actually sits, which moves with the
// viewport and shifts again once the webfont loads, so they are measured rather
// than hard-coded and re-measured on resize and after fonts settle.
document.addEventListener('DOMContentLoaded', function () {
    var strip = document.querySelector('.masthead-strip');
    var masthead = document.querySelector('.masthead');
    var brand = document.querySelector('.masthead-brand');
    if (!strip || !masthead || !brand) return;

    // A drifting background is decoration; anyone who has asked for less motion
    // should not get it at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var track = document.createElement('div');
    track.className = 'strip-track';
    strip.appendChild(track);

    fetch('data/directory.json')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (data) {
            var logos = (data.directory || [])
                .map(function (d) { return d.logo; })
                .filter(Boolean);
            if (logos.length < 8) return;              // not worth running

            // Two passes of the same set, so translating by exactly half the
            // track width loops seamlessly with no visible jump.
            [].concat(logos, logos).forEach(function (file, i) {
                var img = document.createElement('img');
                img.className = 'strip-logo';
                img.src = 'images/logos/optimized/' + file;
                img.alt = '';
                img.setAttribute('aria-hidden', 'true');
                img.loading = i < logos.length ? 'eager' : 'lazy';
                img.onerror = function () { this.remove(); };
                track.appendChild(img);
            });

            strip.classList.add('is-running');
            measure();

            window.addEventListener('resize', measure);
            if (document.fonts && document.fonts.ready) {
                // the wordmark's width changes when Oswald finishes loading
                document.fonts.ready.then(measure);
            }
        })
        .catch(function () { /* no strip - the masthead is fine without it */ });

    function measure() {
        var head = masthead.getBoundingClientRect();
        var b = brand.getBoundingClientRect();

        // where the brand sits, as a percentage of the header width
        var left = ((b.left - head.left) / head.width) * 100;
        var right = ((b.right - head.left) / head.width) * 100;

        // How far the fade runs on either side of the brand. Kept in percent so
        // it scales, but clamped so it never eats the whole gap on a narrow
        // screen or stretches absurdly on a wide one.
        var fade = Math.max(3, Math.min(9, (head.width * 0.05 / head.width) * 100 + 4));

        // The reappearing sliver to the left of the seal only exists if there is
        // room for it. Below roughly 90px it reads as a flicker rather than a
        // logo passing through, so the strip simply starts at the brand instead.
        var hasLeftGap = (b.left - head.left) > 90;

        var stops;
        if (hasLeftGap) {
            stops = [
                'transparent 0%',
                'rgba(0,0,0,1) ' + Math.max(2, left - fade * 1.6).toFixed(2) + '%',
                'transparent ' + left.toFixed(2) + '%',
                'transparent ' + right.toFixed(2) + '%',
                'rgba(0,0,0,1) ' + Math.min(99, right + fade).toFixed(2) + '%',
                'rgba(0,0,0,1) 100%',
            ];
        } else {
            stops = [
                'transparent 0%',
                'transparent ' + right.toFixed(2) + '%',
                'rgba(0,0,0,1) ' + Math.min(99, right + fade).toFixed(2) + '%',
                'rgba(0,0,0,1) 100%',
            ];
        }

        var gradient = 'linear-gradient(to right, ' + stops.join(', ') + ')';
        strip.style.webkitMaskImage = gradient;
        strip.style.maskImage = gradient;
    }
});
