// Homepage load reveal. A circle coin-flips through five photographic sport
// balls (each landing with a squash-and-settle), then flips into the NJAC seal,
// which arrives on a burst of light + a shockwave ring + a shine sweep and keeps
// drifting toward the viewer (Ken Burns) while "A Tradition of Excellence" fades
// in. Finally the seal flies up and docks into the site's header logo as the
// veil clears - the intro becomes the page. Plays once per session, skips on a
// click, honours reduced-motion, and always removes itself (a hard timeout
// guarantees the veil can never linger). Add ?intro to force a replay. Loaded in
// <head> so it covers before the paint.
(function () {
    'use strict';

    var force = /[?&#]intro\b/i.test(location.search + location.hash);
    if (!force) {
        try {
            if (sessionStorage.getItem('njacIntroPlayed')) return;
            sessionStorage.setItem('njacIntroPlayed', '1');
        } catch (e) { /* storage blocked - still fine to play once */ }
        if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    }

    var veil = document.createElement('div');
    veil.id = 'njac-intro';
    veil.setAttribute('aria-hidden', 'true');
    veil.style.cssText = 'position:fixed;inset:0;z-index:2147483647;cursor:pointer;' +
        'background:radial-gradient(120% 90% at 50% 40%,#1a3266 0%,#0b1a3a 55%,#060d1f 100%);' +
        'transition:opacity .8s ease;opacity:1;';
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    veil.appendChild(canvas);
    function mount() { if (!veil.parentNode) (document.body || document.documentElement).appendChild(veil); }
    mount();
    document.addEventListener('DOMContentLoaded', mount);

    var ctx = canvas.getContext('2d');
    var W, H, DPR, cx, cy, R, start = null, firstTs = null, raf = 0, ended = false;
    var PI = Math.PI, PI2 = PI * 2;

    function img(src) { var i = new Image(); i.src = src; return i; }
    var balls = ['basketball', 'soccer', 'tennis', 'lacrosse', 'volleyball'].map(function (n) { return img('images/balls/' + n + '.png'); });
    var logo = img('images/njac-logo.png');
    var assets = balls.concat([logo]);
    function ready() { for (var i = 0; i < assets.length; i++) { if (!assets[i].complete || !assets[i].naturalWidth) return false; } return true; }

    function size() {
        W = window.innerWidth; H = window.innerHeight;
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = W * DPR; canvas.height = H * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        cx = W * 0.5; cy = H * 0.40; R = Math.min(W, H) * 0.20;
    }
    size();

    function ballShadow(r) { ctx.save(); ctx.globalAlpha = 0.30; ctx.fillStyle = '#000';
        try { ctx.filter = 'blur(6px)'; } catch (e) {}
        ctx.beginPath(); ctx.ellipse(0, r * 1.02, r * 0.80, r * 0.20, 0, 0, PI2); ctx.fill(); ctx.restore(); }
    function ballShape(im, r) { if (im.complete && im.naturalWidth) { var s = 2.18 * r; ctx.drawImage(im, -s / 2, -s / 2, s, s); } }
    function crestShape(r) {
        if (logo.complete && logo.naturalWidth) {
            var iw = logo.naturalWidth, ih = logo.naturalHeight, fit = 1.94 * r / Math.max(iw, ih);
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = r * 0.25; ctx.shadowOffsetY = r * 0.06;
            ctx.drawImage(logo, -iw * fit / 2, -ih * fit / 2, iw * fit, ih * fit);
            ctx.restore();
        } else { ctx.beginPath(); ctx.arc(0, 0, r, 0, PI2); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill(); }
    }

    function drawFace(i, sx, sy, r) {
        ctx.save(); ctx.translate(cx, cy);
        if (i < 5) { ballShadow(r); ctx.scale(sx, sy); ballShape(balls[i], r); }
        else { ctx.scale(sx, sy); crestShape(r); }
        ctx.restore();
    }
    function crestAt(x, y, r) { ctx.save(); ctx.translate(x, y); crestShape(r); ctx.restore(); }

    function revealBurst(prog) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        var fade = 1 - prog;
        var bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (1.2 + prog * 1.8));
        bg.addColorStop(0, 'rgba(255,255,255,' + (0.55 * fade).toFixed(3) + ')');
        bg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 0.7 * fade; ctx.strokeStyle = '#dbe7ff'; ctx.lineWidth = Math.max(1, 5 * fade);
        ctx.beginPath(); ctx.arc(cx, cy, R * (1 + prog * 2.4), 0, PI2); ctx.stroke();
        ctx.restore();
    }
    function shineSweep(r, prog) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI2); ctx.clip();
        var x = cx - r * 1.2 + prog * r * 2.6;
        var g = ctx.createLinearGradient(x - r * 0.5, cy - r, x + r * 0.5, cy + r);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
        ctx.restore();
    }
    function spotlight(alpha) {
        ctx.save(); ctx.globalAlpha = alpha;
        var g = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 2.8);
        g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    function wordmark(alpha) {
        if (alpha <= 0) return;
        ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#c8102e'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - R * 0.9, cy + R * 1.52); ctx.lineTo(cx + R * 0.9, cy + R * 1.52); ctx.stroke();
        ctx.font = 'italic 700 ' + Math.min(W * 0.05, 48) + 'px Georgia,"Times New Roman",serif';
        ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(150,185,255,.55)'; ctx.shadowBlur = 18;
        ctx.fillText('A Tradition of Excellence', cx, cy + R * 1.98);
        ctx.restore();
    }

    var SHOW = 440, FLIP = 240, UNIT = SHOW + FLIP, BALLS = 5;
    var LOGO_HOLD = 700, SWAP = 800, TAG_HOLD = 1500, OUTRO = 850;
    var ballsEnd = BALLS * UNIT, total = LOGO_HOLD + SWAP + TAG_HOLD;
    function easeInOut(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }

    var hx, hy, hr, homed = false;
    function computeHome() {
        var el = document.querySelector('.masthead-logo'), rc = el && el.getBoundingClientRect();
        if (rc && rc.width > 4 && rc.height > 4) { hx = rc.left + rc.width / 2; hy = rc.top + rc.height / 2; hr = Math.min(rc.width, rc.height) / 2; }
        else { hx = cx; hy = H * 0.12; hr = R * 0.4; }
        homed = true;
    }

    function frame(ts) {
        if (ended) return;
        if (firstTs === null) firstTs = ts;
        if (start === null) {
            if (ready() || ts - firstTs > 3000) start = ts;
            else { raf = requestAnimationFrame(frame); return; }
        }
        var e = ts - start;
        ctx.clearRect(0, 0, W, H);
        spotlight(0.85);

        if (e < ballsEnd) {
            var idx = Math.floor(e / UNIT), into = e - idx * UNIT;
            if (into < SHOW) {
                var st = into < 200 ? (1 - into / 200) : 0, a = st * st;
                drawFace(idx, 1 + 0.12 * a, 1 - 0.12 * a, R);
            } else {
                var q = (into - SHOW) / FLIP, sxx = Math.abs(Math.cos(q * PI)), f = q < 0.5 ? idx : idx + 1;
                drawFace(f, sxx, 1, R);
            }
        } else {
            var t = e - ballsEnd;
            if (t < total) {
                var kb = 1 + 0.19 * Math.min(1, t / total);
                drawFace(5, 1, 1, R * kb);
                if (t < 720) shineSweep(R * kb, t / 720);
                if (t < 520) revealBurst(t / 520);
                if (t > LOGO_HOLD) wordmark(Math.min(1, (t - LOGO_HOLD) / SWAP));
            } else if (t < total + OUTRO) {
                if (!homed) { computeHome(); veil.style.transition = 'none'; }
                var o = (t - total) / OUTRO, oe = easeInOut(o);
                veil.style.opacity = String(1 - Math.max(0, (o - 0.35) / 0.65));
                wordmark(Math.max(0, 1 - o * 2.2));
                crestAt(cx + (hx - cx) * oe, cy + (hy - cy) * oe, (R * 1.19) + (hr - R * 1.19) * oe);
            } else { finish(); return; }
        }
        raf = requestAnimationFrame(frame);
    }

    function finish() {
        if (ended) return; ended = true;
        if (raf) cancelAnimationFrame(raf);
        veil.style.opacity = '0';
        setTimeout(function () { if (veil.parentNode) veil.parentNode.removeChild(veil); }, 900);
    }

    veil.addEventListener('click', finish);
    window.addEventListener('resize', size);
    setTimeout(finish, 12000);           // hard safety net
    raf = requestAnimationFrame(frame);
})();
