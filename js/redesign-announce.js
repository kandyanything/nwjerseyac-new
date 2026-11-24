// Site-wide announcement pop-up. Reads data/announcement.json and, if it is
// active, shows a dismissible modal after the intro finishes. The admin picks
// how long it keeps showing via "mode":
//   "once"        - a single time per visitor (any close ends it). Default.
//   "acknowledge" - returns every visit until the visitor clicks the primary
//                   "don't show again" button; a casual close (X / Esc) only
//                   hides it for that browser session.
//   "untilDate"   - shows every session until "endDate" (YYYY-MM-DD) passes,
//                   then comes down on its own; a close hides it for the session.
//   "every"       - shows on every visit until the visitor clicks "Don't show
//                   this again". Closing it any other way (X, Esc, "Maybe
//                   later", clicking outside, following its link) remembers
//                   nothing, so it is back on the next visit.
// "id" keys the memory, so posting a new message (new id) re-shows it to
// everyone. Add ?announce to the URL to preview. Fully editable from the CMS.
//
// Running one message for a set time, then going back to another:
//   "until": "YYYY-MM-DD"  - after the end of that day this message is skipped...
//   "then":  { ... }       - ...and this one (a whole announcement) is used instead.
// So a 10-day message can sit in front of the usual welcome and step aside by itself.
//
// Champions: "champions": [{ "label": "Boys", "items": [{ "school", "division", "logo" }] }]
// shows the winners' logos in groups; "icon": "xc" puts a cross-country runner badge on top,
// and "iconLogo" (an image path) puts that logo in the circle with the runner badge under it.
//
// Job posting: "layout": "hiring" with "hiring": { "kicker", "role", "pitch",
// "closes" (ISO date-time the applications close), "closesLabel", "applyUrl",
// "applyLabel", "detailsUrl", "detailsLabel" } draws a navy posting card with
// a NOW HIRING ribbon, the role title, a live countdown to the deadline and an
// Apply button (opens the application in a new tab).
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        fetch('data/announcement.json', { cache: 'no-store' })
            .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
            .then(function (a) {
                a = current(a);
                if (!a || !a.active || !a.title) return;
                var id = a.id || 'announcement';
                var mode = a.mode || (a.frequency === 'always' ? 'always' : 'once');
                var force = /[?&#]announce\b/i.test(location.search + location.hash);
                if (!force && !shouldShow(mode, id, a.endDate)) return;
                waitForIntro(function () { (a.layout === 'hiring' && a.hiring ? renderHiring : render)(a, id, mode, force); });
            })
            .catch(function () { /* no announcement, no problem */ });
    });

    // The message in force today: skip any whose "until" date has passed.
    function current(a) {
        for (var i = 0; a && a.until && i < 10; i++) {
            var e = endOfDay(a.until);
            if (isNaN(e) || Date.now() <= e) break;
            a = a.then || null;
        }
        return a;
    }

    // ---- storage + gating ----------------------------------------------
    function lget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lset(k) { try { localStorage.setItem(k, '1'); } catch (e) {} }
    function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
    function sset(k) { try { sessionStorage.setItem(k, '1'); } catch (e) {} }
    function endOfDay(d) { var t = new Date(String(d).slice(0, 10) + 'T23:59:59'); return isNaN(t.getTime()) ? NaN : t.getTime(); }

    function shouldShow(mode, id, endDate) {
        if (mode === 'always') return true;
        if (mode === 'untilDate') {
            var e = endDate ? endOfDay(endDate) : NaN;
            if (!isNaN(e) && Date.now() > e) return false;          // the date has passed - it comes down
            return !sget('annDismiss_' + id);                        // else once per session
        }
        if (mode === 'every') return !lget('annNever_' + id);        // only "Don't show this again" stops it
        if (mode === 'acknowledge') {
            if (lget('annAck_' + id)) return false;                  // already acknowledged for good
            return !sget('annDismiss_' + id);                        // else once per session until acknowledged
        }
        return !lget('annSeen_' + id);                               // "once": a single time ever
    }

    function remember(mode, id, acknowledged) {
        if (mode === 'once') lset('annSeen_' + id);
        else if (mode === 'acknowledge') { if (acknowledged) lset('annAck_' + id); else sset('annDismiss_' + id); }
        else if (mode === 'untilDate') sset('annDismiss_' + id);
        else if (mode === 'every') { if (acknowledged) lset('annNever_' + id); }
        // "always" remembers nothing
    }

    // The intro veil owns the screen first; wait until it is gone.
    function waitForIntro(cb) {
        // Every intro veil in this family plus the Pink October canvas. The old
        // test named only two ids, so it could not tell that Pink October was
        // still playing and the modal opened on top of it.
        var INTRO_IDS = ['bnc-intro','njac-intro','sec-intro','UCIAC-intro','skyland-intro','ucc-intro','po-intro'];
        function gone() {
            for (var i = 0; i < INTRO_IDS.length; i++) {
                if (document.getElementById(INTRO_IDS[i])) return false;
            }
            return true;
        }
        if (gone()) { setTimeout(cb, 300); return; }
        var t0 = Date.now();
        var iv = setInterval(function () {
            if (gone() || Date.now() - t0 > 9000) { clearInterval(iv); setTimeout(cb, 250); }
        }, 200);
    }

    var CSS =
        '.ann-backdrop{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;' +
        'padding:20px;background:rgba(6,8,11,.62);opacity:0;transition:opacity .25s ease;}' +
        '.ann-backdrop.is-open{opacity:1;}' +
        '.ann-card{position:relative;width:100%;max-width:440px;background:#fff;border-radius:14px;overflow:hidden;' +
        'box-shadow:0 30px 80px rgba(0,0,0,.5);transform:translateY(14px) scale(.97);transition:transform .3s cubic-bezier(.2,.8,.3,1.2);' +
        'font-family:var(--font-body,system-ui,-apple-system,"Segoe UI",sans-serif);}' +
        '.ann-backdrop.is-open .ann-card{transform:none;}' +
        '.ann-bar{height:6px;background:var(--red,#c8102e);}' +
        '.ann-x{position:absolute;top:9px;right:12px;border:0;background:none;font-size:27px;line-height:1;color:#9aa2ad;cursor:pointer;padding:2px 7px;border-radius:6px;}' +
        '.ann-x:hover{color:#22262c;background:#f0f1f3;}' +
        '.ann-x:focus-visible{outline:2px solid var(--red,#c8102e);outline-offset:2px;}' +
        '.ann-eyebrow{margin:20px 26px 0;font-size:.7rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--red,#c8102e);}' +
        '.ann-title{font-family:var(--font-display,inherit);margin:6px 26px 8px;font-size:1.5rem;line-height:1.15;color:#14181c;text-transform:uppercase;letter-spacing:.01em;text-wrap:balance;}' +
        '.ann-body{margin:0 26px 20px;color:#48505b;font-size:1rem;line-height:1.55;}' +
        '.ann-actions{display:flex;gap:10px;flex-wrap:wrap;padding:0 26px 24px;}' +
        '.ann-btn{font:inherit;font-weight:600;font-size:.88rem;letter-spacing:.03em;padding:11px 20px;border-radius:8px;cursor:pointer;text-decoration:none;border:2px solid transparent;transition:all .15s;}' +
        '.ann-btn--primary{background:var(--red,#c8102e);color:#fff;}' +
        '.ann-btn--primary:hover{filter:brightness(1.1);}' +
        '.ann-btn--ghost{background:transparent;color:#48505b;border-color:#d6dadf;}' +
        '.ann-btn--ghost:hover{background:#f2f3f5;}' +
        '.ann-btn:focus-visible{outline:2px solid var(--red,#c8102e);outline-offset:2px;}' +
        '.ann-card--wide{max-width:540px;}' +
        '.ann-mark{display:flex;flex-direction:column;align-items:center;gap:8px;margin:22px 0 2px;}' +
        '.ann-mark .ann-crest{width:84px;height:84px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 8px 22px rgba(0,0,0,.16);border:3px solid var(--red,#c8102e);overflow:hidden;}' +
        '.ann-mark .ann-crest img{width:76px;height:76px;object-fit:contain;}' +
        '.ann-mark .ann-run{display:inline-flex;align-items:center;gap:6px;background:var(--red,#c8102e);color:#fff;border-radius:999px;padding:5px 12px 5px 9px;font:800 .7rem/1 var(--font-display,system-ui);letter-spacing:.14em;}' +
        '.ann-mark .ann-run svg{width:18px;height:18px;}' +
        '.ann-icon{display:flex;justify-content:center;margin:22px 0 2px;}' +
        '.ann-icon span{width:64px;height:64px;border-radius:50%;background:var(--red,#c8102e);color:#fff;display:grid;place-items:center;position:relative;box-shadow:0 8px 20px rgba(0,0,0,.18);}' +
        '.ann-icon svg{width:36px;height:36px;}' +
        '.ann-icon b{position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);background:#14181c;color:#fff;font:800 .62rem/1 var(--font-display,system-ui);letter-spacing:.12em;padding:4px 7px;border-radius:999px;}' +
        '.ann-card--wide .ann-eyebrow,.ann-card--wide .ann-title,.ann-card--wide .ann-body{text-align:center;}' +
        '.ann-champs{display:grid;gap:14px;margin:0 22px 22px;}' +
        '.ann-group h3{margin:0 0 8px;font:700 .72rem/1 var(--font-body,system-ui);letter-spacing:.16em;text-transform:uppercase;color:#6b7380;text-align:center;}' +
        '.ann-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;}' +
        '.ann-champ{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #e3e6ea;border-radius:12px;background:#fafbfc;}' +
        '.ann-champ img{width:46px;height:46px;object-fit:contain;flex:none;}' +
        '.ann-champ strong{display:block;font-family:var(--font-display,inherit);font-size:1.05rem;line-height:1.1;color:#14181c;text-transform:uppercase;}' +
        '.ann-champ small{display:block;color:#6b7380;font-size:.78rem;margin-top:2px;}' +
        '.ann-card--wide .ann-actions{justify-content:center;}' +
        '@media (prefers-reduced-motion:reduce){.ann-backdrop,.ann-card{transition:none;}}';
    /* a runner, for cross country (Material "directions_run", Apache 2.0) */
    var RUNNER = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>';

    function render(a, id, mode, force) {
        if (document.getElementById('bnc-announce')) return;
        if (!document.getElementById('ann-css')) {
            var st = document.createElement('style'); st.id = 'ann-css'; st.textContent = CSS; document.head.appendChild(st);
        }

        var back = document.createElement('div');
        back.id = 'bnc-announce'; back.className = 'ann-backdrop';
        back.setAttribute('role', 'dialog'); back.setAttribute('aria-modal', 'true'); back.setAttribute('aria-labelledby', 'ann-title');

        var card = document.createElement('div'); card.className = 'ann-card' + (a.champions ? ' ann-card--wide' : '');
        var bar = document.createElement('div'); bar.className = 'ann-bar';
        var x = document.createElement('button'); x.className = 'ann-x'; x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.innerHTML = '&times;';
        card.appendChild(bar); card.appendChild(x);
        if (a.icon === 'xc' && a.iconLogo) {
            var mk = document.createElement('div'); mk.className = 'ann-mark';
            var crest = document.createElement('span'); crest.className = 'ann-crest';
            var cim = document.createElement('img'); cim.src = a.iconLogo; cim.alt = ''; crest.appendChild(cim);
            var run = document.createElement('span'); run.className = 'ann-run'; run.innerHTML = RUNNER + 'XC';
            mk.appendChild(crest); mk.appendChild(run);
            card.appendChild(mk);
        } else if (a.icon === 'xc') {
            var ic = document.createElement('div'); ic.className = 'ann-icon';
            ic.innerHTML = '<span>' + RUNNER + '<b>XC</b></span>';
            card.appendChild(ic);
        }
        if (a.eyebrow) { var ey = document.createElement('div'); ey.className = 'ann-eyebrow'; ey.textContent = a.eyebrow; card.appendChild(ey); }
        var h = document.createElement('h2'); h.id = 'ann-title'; h.className = 'ann-title'; h.textContent = a.title; card.appendChild(h);
        if (a.body) { var p = document.createElement('p'); p.className = 'ann-body'; p.textContent = a.body; card.appendChild(p); }
        if (a.champions && a.champions.length) {
            var wrap = document.createElement('div'); wrap.className = 'ann-champs';
            a.champions.forEach(function (g) {
                var grp = document.createElement('div'); grp.className = 'ann-group';
                if (g.label) { var gh = document.createElement('h3'); gh.textContent = g.label; grp.appendChild(gh); }
                var row = document.createElement('div'); row.className = 'ann-row';
                (g.items || []).forEach(function (c) {
                    var el = document.createElement('div'); el.className = 'ann-champ';
                    if (c.logo) { var im = document.createElement('img'); im.src = c.logo; im.alt = ''; im.width = 46; im.height = 46; el.appendChild(im); }
                    var tx = document.createElement('div');
                    var nm = document.createElement('strong'); nm.textContent = c.school || ''; tx.appendChild(nm);
                    if (c.division) { var dv = document.createElement('small'); dv.textContent = c.division; tx.appendChild(dv); }
                    el.appendChild(tx); row.appendChild(el);
                });
                grp.appendChild(row); wrap.appendChild(grp);
            });
            card.appendChild(wrap);
        }

        var actions = document.createElement('div'); actions.className = 'ann-actions';
        if (a.linkUrl) {
            var link = document.createElement('a'); link.className = 'ann-btn ann-btn--primary';
            link.href = a.linkUrl; link.textContent = a.linkLabel || 'Learn More';
            if (/^https?:/i.test(a.linkUrl)) { link.target = '_blank'; link.rel = 'noopener'; }
            link.addEventListener('click', function () { dismiss(mode !== 'every'); });   // engaging with the CTA counts as received (not in "every" mode)
            actions.appendChild(link);
        }
        var got = document.createElement('button'); got.type = 'button'; got.className = 'ann-btn ann-btn--ghost';
        got.textContent = (mode === 'acknowledge' || mode === 'every') ? "Don't show this again" : (a.linkUrl ? 'Dismiss' : 'Got it');
        actions.appendChild(got);
        card.appendChild(actions);

        back.appendChild(card);
        document.body.appendChild(back);
        requestAnimationFrame(function () { back.classList.add('is-open'); });
        setTimeout(function () { x.focus(); }, 60);

        function dismiss(acknowledged) {
            back.classList.remove('is-open');
            setTimeout(function () { if (back.parentNode) back.parentNode.removeChild(back); }, 260);
            document.removeEventListener('keydown', onKey);
            if (!force) remember(mode, id, acknowledged);
        }
        function onKey(e) {
            if (e.key === 'Escape') dismiss(false);
            if (e.key === 'Tab') {
                var f = back.querySelectorAll('button, a[href]');
                if (!f.length) return;
                var first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }
        x.addEventListener('click', function () { dismiss(false); });
        got.addEventListener('click', function () { dismiss(true); });
        back.addEventListener('click', function (e) { if (e.target === back) dismiss(false); });
        document.addEventListener('keydown', onKey);
    }

    // ---- "hiring" job-posting layout -----------------------------------------
    var HIRING_CSS =
        '.annh{position:relative;width:100%;max-width:600px;max-height:calc(100vh - 32px);overflow:auto;border-radius:18px;background:#fff;isolation:isolate;' +
        'box-shadow:0 40px 90px rgba(0,0,0,.55);transform:translateY(16px) scale(.97);transition:transform .4s cubic-bezier(.2,.8,.3,1.2);' +
        'font-family:var(--font-body,system-ui,-apple-system,"Segoe UI",sans-serif);}' +
        '.ann-backdrop.is-open .annh{transform:none;}' +
        '.annh-top{position:relative;overflow:hidden;padding:38px 34px 30px;color:#fff;text-align:center;' +
        'background:radial-gradient(90% 120% at 50% -10%,rgba(80,130,230,.55),transparent 60%),linear-gradient(165deg,#12275a 0%,#0b1a3a 70%);}' +
        /* faint court lines and a light beam that sweeps across */
        '.annh-top::before{content:"";position:absolute;inset:0;z-index:0;opacity:.14;pointer-events:none;' +
        'background:radial-gradient(circle at 50% 118%,transparent 0 120px,#fff 120px 122px,transparent 122px),' +
        'linear-gradient(#fff,#fff) 50% 0/2px 100% no-repeat,radial-gradient(circle at 50% 50%,transparent 0 56px,#fff 56px 58px,transparent 58px);}' +
        '.annh-top::after{content:"";position:absolute;top:-40%;bottom:-40%;left:-30%;width:28%;z-index:0;pointer-events:none;' +
        'background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);transform:skewX(-18deg) translateX(0);}' +
        '.ann-backdrop.is-open .annh-top::after{animation:annhBeam 4.5s ease-in-out .9s infinite;}' +
        '@keyframes annhBeam{0%{transform:skewX(-18deg) translateX(0);}45%,100%{transform:skewX(-18deg) translateX(560%);}}' +
        '.annh-top>*{position:relative;z-index:1;}' +
        /* NOW HIRING corner ribbon */
        '.annh-ribbon{position:absolute !important;top:26px;left:-52px;z-index:3 !important;width:200px;transform:rotate(-45deg);background:#c8102e;color:#fff;text-align:center;' +
        'font:700 .7rem/1 var(--font-display,system-ui);letter-spacing:.2em;text-transform:uppercase;padding:8px 0;box-shadow:0 6px 16px rgba(0,0,0,.35);overflow:hidden;}' +
        '.annh-ribbon::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%);transform:translateX(-100%);}' +
        '.ann-backdrop.is-open .annh-ribbon::after{animation:annhShine 3s ease 1.4s infinite;}' +
        '@keyframes annhShine{0%{transform:translateX(-100%);}40%,100%{transform:translateX(100%);}}' +
        '.annh-x{position:absolute;top:12px;right:14px;z-index:4;width:36px;height:36px;border:0;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.12);color:#fff;font-size:24px;line-height:1;cursor:pointer;}' +
        '.annh-x:hover{background:rgba(255,255,255,.24);}.annh-x:focus-visible{outline:2px solid #fff;outline-offset:2px;}' +
        /* logo seal with a turning ring */
        '.annh-seal{position:relative;width:96px;height:96px;margin:0 auto 16px;}' +
        '.annh-seal img{position:absolute;inset:12px;width:72px;height:72px;object-fit:contain;background:#fff;border-radius:50%;padding:8px;box-shadow:0 8px 22px rgba(0,0,0,.35);}' +
        '.annh-ring{position:absolute;inset:0;border-radius:50%;border:2px dashed rgba(255,255,255,.5);}' +
        '.ann-backdrop.is-open .annh-ring{animation:annhSpin 14s linear infinite;}' +
        '.annh-ring::before{content:"";position:absolute;top:-5px;left:50%;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:#c8102e;box-shadow:0 0 0 3px rgba(200,16,46,.3);}' +
        '@keyframes annhSpin{to{transform:rotate(360deg);}}' +
        '.annh-kicker{margin:0 0 6px;font-size:.72rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#9fbaf2;}' +
        '.annh-role{margin:0;font-family:var(--font-display,inherit);font-weight:700;font-size:2.8rem;line-height:1;text-transform:uppercase;letter-spacing:.02em;}' +
        '.annh-ch{display:inline-block;opacity:0;transform:translateY(18px);}' +
        '.ann-backdrop.is-open .annh-ch{animation:annhUp .5s cubic-bezier(.2,.9,.3,1.3) calc(.25s + var(--i) * .035s) forwards;}' +
        '@keyframes annhUp{to{opacity:1;transform:none;}}' +
        '.annh-rule{display:block;width:0;height:3px;margin:14px auto 14px;background:#c8102e;border-radius:2px;}' +
        '.ann-backdrop.is-open .annh-rule{animation:annhRule .7s ease .9s forwards;}' +
        '@keyframes annhRule{to{width:84px;}}' +
        '.annh-pitch{margin:0 auto;max-width:44ch;color:#d9e3f7;font-size:.98rem;line-height:1.55;}' +
        /* countdown */
        '.annh-clock{display:flex;justify-content:center;gap:10px;margin:22px 0 8px;}' +
        '.annh-unit{min-width:66px;padding:10px 6px 8px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);}' +
        '.annh-num{display:block;font:700 1.9rem/1 var(--font-display,system-ui);font-variant-numeric:tabular-nums;}' +
        '.annh-num.tick{animation:annhTick .35s ease;}' +
        '@keyframes annhTick{0%{transform:translateY(-6px);opacity:.3;}100%{transform:none;opacity:1;}}' +
        '.annh-lbl{display:block;margin-top:5px;font-size:.62rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#9fbaf2;}' +
        '.annh-close{margin:8px 0 0;font-size:.86rem;font-weight:600;color:#fff;}' +
        '.annh-close b{color:#ff8a9c;}' +
        /* white footer with the buttons */
        '.annh-foot{padding:22px 28px 16px;text-align:center;}' +
        '.annh-apply{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:15px 18px;border-radius:10px;text-decoration:none;' +
        'background:#c8102e;color:#fff;font-family:var(--font-display,inherit);font-weight:600;font-size:1.08rem;letter-spacing:.1em;text-transform:uppercase;' +
        'box-shadow:0 12px 26px rgba(200,16,46,.3);transition:background .15s,transform .15s;}' +
        '.annh-apply:hover{background:#9d0c24;transform:translateY(-1px);}.annh-apply:focus-visible{outline:3px solid #1b3c86;outline-offset:3px;}' +
        '.annh-apply svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transition:transform .2s;}' +
        '.annh-apply:hover svg{transform:translateX(3px);}' +
        '.annh-apply::after{content:"";position:absolute;inset:-3px;border-radius:12px;border:2px solid #c8102e;opacity:0;pointer-events:none;}' +
        '.ann-backdrop.is-open .annh-apply::after{animation:annhPulse 2.4s ease-out 1.6s infinite;}' +
        '@keyframes annhPulse{0%{opacity:.7;transform:scale(1);}70%,100%{opacity:0;transform:scale(1.05,1.25);}}' +
        '.annh-details{display:inline-block;margin-top:12px;color:#1b3c86;font-weight:700;font-size:.92rem;text-decoration:none;}' +
        '.annh-details:hover{text-decoration:underline;}' +
        '.annh-sub{display:flex;justify-content:center;align-items:center;gap:2px;margin-top:8px;padding-top:10px;border-top:1px solid #e4e8f0;}' +
        '.annh-sub span{color:#b5bcc8;font-size:.8rem;}' +
        '.annh-link{background:none;border:0;color:#5a6478;font:inherit;font-size:.86rem;padding:8px;cursor:pointer;border-radius:6px;}' +
        '.annh-link:hover{color:#14181f;text-decoration:underline;}.annh-link:focus-visible{outline:2px solid #1b3c86;outline-offset:1px;}' +
        '@media (max-width:520px){' +
        '.annh-top{padding:34px 18px 24px;}.annh-seal{width:78px;height:78px;margin-bottom:12px;}.annh-seal img{inset:10px;width:58px;height:58px;padding:6px;}' +
        '.annh-role{font-size:2.15rem;}.annh-pitch{font-size:.9rem;}' +
        '.annh-clock{gap:7px;}.annh-unit{min-width:0;flex:1;max-width:72px;padding:9px 4px 7px;}.annh-num{font-size:1.55rem;}' +
        '.annh-ribbon{top:18px;left:-60px;font-size:.6rem;}' +
        '.annh-foot{padding:18px 18px 12px;}' +
        '}' +
        '@media (prefers-reduced-motion:reduce){' +
        '.annh,.annh-apply{transition:none;}.annh-top::after,.annh-ribbon::after,.annh-ring,.annh-ch,.annh-rule,.annh-apply::after,.annh-num.tick{animation:none !important;}' +
        '.annh-ch{opacity:1;transform:none;}.annh-rule{width:84px;}' +
        '}';

    function renderHiring(a, id, mode, force) {
        if (document.getElementById('bnc-announce')) return;
        if (!document.getElementById('ann-css')) {
            var st = document.createElement('style'); st.id = 'ann-css'; st.textContent = CSS; document.head.appendChild(st);
        }
        if (!document.getElementById('ann-hiring-css')) {
            var st2 = document.createElement('style'); st2.id = 'ann-hiring-css'; st2.textContent = HIRING_CSS; document.head.appendChild(st2);
        }
        var h = a.hiring;
        var closes = h.closes ? new Date(h.closes).getTime() : NaN;

        var back = document.createElement('div');
        back.id = 'bnc-announce'; back.className = 'ann-backdrop';
        back.setAttribute('role', 'dialog'); back.setAttribute('aria-modal', 'true'); back.setAttribute('aria-labelledby', 'ann-title');
        var card = document.createElement('div'); card.className = 'annh';

        var top = document.createElement('div'); top.className = 'annh-top';
        var rib = document.createElement('div'); rib.className = 'annh-ribbon'; rib.setAttribute('aria-hidden', 'true'); rib.textContent = h.ribbon || 'Now Hiring';
        top.appendChild(rib);
        var x = document.createElement('button'); x.type = 'button'; x.className = 'annh-x'; x.setAttribute('aria-label', 'Close'); x.innerHTML = '&times;';
        top.appendChild(x);
        if (a.logo) {
            var seal = document.createElement('div'); seal.className = 'annh-seal';
            seal.innerHTML = '<span class="annh-ring" aria-hidden="true"></span>';
            var lg = document.createElement('img'); lg.src = a.logo; lg.alt = a.logoAlt || ''; seal.appendChild(lg);
            top.appendChild(seal);
        }
        if (h.kicker) { var k = document.createElement('p'); k.className = 'annh-kicker'; k.textContent = h.kicker; top.appendChild(k); }
        var role = document.createElement('h2'); role.id = 'ann-title'; role.className = 'annh-role';
        role.setAttribute('aria-label', (h.ribbon || 'Now Hiring') + ': ' + (h.role || a.title));
        var inner = document.createElement('span'); inner.setAttribute('aria-hidden', 'true');
        String(h.role || a.title).split('').forEach(function (c, i) {
            if (c === ' ') { inner.appendChild(document.createTextNode(' ')); return; }
            var sp = document.createElement('span'); sp.className = 'annh-ch'; sp.style.setProperty('--i', i); sp.textContent = c; inner.appendChild(sp);
        });
        role.appendChild(inner); top.appendChild(role);
        var rule = document.createElement('span'); rule.className = 'annh-rule'; rule.setAttribute('aria-hidden', 'true'); top.appendChild(rule);
        if (h.pitch) { var pp = document.createElement('p'); pp.className = 'annh-pitch'; pp.textContent = h.pitch; top.appendChild(pp); }

        // live countdown to the deadline
        var clock = null, nums = {};
        if (!isNaN(closes)) {
            clock = document.createElement('div'); clock.className = 'annh-clock'; clock.setAttribute('aria-hidden', 'true');
            [['d', 'Days'], ['h', 'Hours'], ['m', 'Min'], ['s', 'Sec']].forEach(function (u) {
                var box = document.createElement('div'); box.className = 'annh-unit';
                var n = document.createElement('span'); n.className = 'annh-num'; n.textContent = '00';
                var l = document.createElement('span'); l.className = 'annh-lbl'; l.textContent = u[1];
                box.appendChild(n); box.appendChild(l); clock.appendChild(box); nums[u[0]] = n;
            });
            top.appendChild(clock);
        }
        if (h.closesLabel) {
            var cl = document.createElement('p'); cl.className = 'annh-close';
            cl.innerHTML = 'Applications close <b></b>'; cl.querySelector('b').textContent = h.closesLabel;
            top.appendChild(cl);
        }
        card.appendChild(top);

        var foot = document.createElement('div'); foot.className = 'annh-foot';
        var apply = null;
        if (h.applyUrl) {
            apply = document.createElement('a'); apply.className = 'annh-apply'; apply.href = h.applyUrl; apply.target = '_blank'; apply.rel = 'noopener';
            apply.textContent = h.applyLabel || 'Apply Now';
            apply.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>');
            apply.setAttribute('aria-label', (h.applyLabel || 'Apply Now') + ' (opens the application in a new tab)');
            foot.appendChild(apply);
        }
        if (h.detailsUrl) {
            var det = document.createElement('a'); det.className = 'annh-details'; det.href = h.detailsUrl; det.textContent = h.detailsLabel || 'Position details';
            foot.appendChild(det);
        }
        var sub = document.createElement('div'); sub.className = 'annh-sub';
        var later = document.createElement('button'); later.type = 'button'; later.className = 'annh-link'; later.textContent = a.laterLabel || 'Maybe later';
        var dot = document.createElement('span'); dot.setAttribute('aria-hidden', 'true'); dot.textContent = '•';
        var got = document.createElement('button'); got.type = 'button'; got.className = 'annh-link'; got.textContent = a.dismissLabel || "Don't show this again";
        sub.appendChild(later); sub.appendChild(dot); sub.appendChild(got); foot.appendChild(sub);
        card.appendChild(foot);

        back.appendChild(card);
        document.body.appendChild(back);
        requestAnimationFrame(function () { back.classList.add('is-open'); });
        setTimeout(function () { x.focus(); }, 60);

        var timer = null, last = {};
        function pad(v) { return (v < 10 ? '0' : '') + v; }
        function tick() {
            var left = Math.max(0, closes - Date.now());
            var v = { d: Math.floor(left / 864e5), h: Math.floor(left / 36e5) % 24, m: Math.floor(left / 6e4) % 60, s: Math.floor(left / 1e3) % 60 };
            Object.keys(v).forEach(function (key) {
                var t = pad(v[key]);
                if (last[key] !== t) {
                    nums[key].textContent = t;
                    if (last[key] !== undefined) { nums[key].classList.remove('tick'); void nums[key].offsetWidth; nums[key].classList.add('tick'); }
                    last[key] = t;
                }
            });
            if (!left && timer) { clearInterval(timer); timer = null; }
        }
        if (clock) { tick(); timer = setInterval(tick, 1000); }

        function dismiss(acknowledged) {
            if (timer) clearInterval(timer);
            back.classList.remove('is-open');
            setTimeout(function () { if (back.parentNode) back.parentNode.removeChild(back); }, 260);
            document.removeEventListener('keydown', onKey);
            if (!force) remember(mode, id, acknowledged);
        }
        function onKey(e) {
            if (e.key === 'Escape') dismiss(false);
            if (e.key === 'Tab') {
                var f = [].slice.call(back.querySelectorAll('button, a[href]'));
                var first = f[0], lastEl = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
                else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
            }
        }
        x.addEventListener('click', function () { dismiss(false); });
        later.addEventListener('click', function () { dismiss(false); });
        got.addEventListener('click', function () { dismiss(true); });
        // following a link closes the card; in "every" mode it still comes back next visit
        if (apply) apply.addEventListener('click', function () { dismiss(mode !== 'every'); });
        back.addEventListener('click', function (e) { if (e.target === back) dismiss(false); });
        document.addEventListener('keydown', onKey);
    }
})();
