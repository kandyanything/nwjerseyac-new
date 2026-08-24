// Today at a Glance: what is actually happening across the conference now.
//
// Reads data/schedule/upcoming.json, an eight-day window the nightly build
// writes alongside the month files. A month file runs to 557 KB, far too much
// to load on a homepage to show a few days; the window is 136 KB raw and about
// 5 KB once Netlify compresses it.
//
// "Today" is the conference's today, not the reader's. Someone opening this in
// California at 9pm Sunday should see Monday's New Jersey fixtures, because the
// games are in New Jersey. Every date in the feed is already Eastern, so the
// comparison has to be made in Eastern too.
document.addEventListener('DOMContentLoaded', function () {
    var root = document.querySelector('.njac-today');
    if (!root) return;

    var lede = root.querySelector('.today-lede');
    var days = root.querySelector('.today-days');
    var panel = root.querySelector('.today-panel');

    var DAY_CHIPS = 5;      // today plus the next four days that have fixtures
    var GAME_ROWS = 10;     // beyond this, send them to the full calendar

    var byDate = {};
    var dates = [];
    var today = easternToday();
    var selected = null;
    var sport = '';         // '' means every sport

    function easternToday() {
        try {
            return new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/New_York',
                year: 'numeric', month: '2-digit', day: '2-digit',
            }).format(new Date());
        } catch (e) {
            return new Date().toISOString().slice(0, 10);
        }
    }

    fetch('data/schedule/upcoming.json')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (data) {
            (data.games || []).forEach(function (g) {
                if (g.date < today) return;                  // the build may predate the visit
                if (!byDate[g.date]) { byDate[g.date] = []; dates.push(g.date); }
                byDate[g.date].push(g);
            });
            dates.sort();
            if (!dates.length) { root.style.display = 'none'; return; }

            render();
        })
        .catch(function () { root.style.display = 'none'; });

    function render() {
        var shown = dates.slice(0, DAY_CHIPS);
        selected = shown[0];

        // The heading promises today. If there is nothing today - a Sunday, or
        // between seasons - say so plainly rather than quietly showing another
        // day's fixtures under a heading that claims otherwise.
        if (dates[0] !== today) {
            lede.textContent = 'No NJAC games today. Here is what is coming up.';
            lede.hidden = false;
        } else {
            lede.hidden = true;
        }

        days.innerHTML = '';
        shown.forEach(function (date) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'today-day' + (date === selected ? ' is-on' : '');
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-selected', date === selected ? 'true' : 'false');
            b.dataset.date = date;

            var name = document.createElement('span');
            name.className = 'today-day-name';
            name.textContent = dayLabel(date);

            var n = document.createElement('span');
            n.className = 'today-day-count';
            n.textContent = byDate[date].length;

            b.appendChild(name);
            b.appendChild(n);
            b.addEventListener('click', function () {
                selected = this.dataset.date;

                // Someone following one sport should keep following it as they
                // move through the week - but only where that sport is actually
                // playing, or the panel would come up empty with no explanation.
                if (sport && !byDate[selected].some(function (g) { return g.sport === sport; })) sport = '';

                [].forEach.call(days.children, function (c) {
                    var on = c.dataset.date === selected;
                    c.classList.toggle('is-on', on);
                    c.setAttribute('aria-selected', on ? 'true' : 'false');
                });
                showDay();
            });
            days.appendChild(b);
        });

        showDay();
    }

    function dayLabel(date) {
        if (date === today) return 'Today';
        var d = new Date(date + 'T12:00:00');
        var tomorrow = new Date(today + 'T12:00:00');
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date === tomorrow.toISOString().slice(0, 10)) return 'Tomorrow';
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    function showDay() {
        var all = byDate[selected] || [];
        panel.innerHTML = '';

        // A count per sport reads faster than sixty rows, and tells a parent in
        // one glance whether their sport is even playing today. Each one is also
        // the filter for it.
        var counts = {};
        all.forEach(function (g) { counts[g.sport] = (counts[g.sport] || 0) + 1; });
        var sports = Object.keys(counts).sort(function (a, b) {
            return counts[b] - counts[a] || a.localeCompare(b);
        });

        var sum = document.createElement('div');
        sum.className = 'today-sports';
        sum.appendChild(sportPill('All sports', '', all.length));
        sports.forEach(function (s) { sum.appendChild(sportPill(s, s, counts[s])); });
        panel.appendChild(sum);

        var list = sport ? all.filter(function (g) { return g.sport === sport; }) : all;

        var rows = document.createElement('div');
        rows.className = 'today-games';
        list.slice(0, GAME_ROWS).forEach(function (g) { rows.appendChild(buildRow(g)); });
        panel.appendChild(rows);

        var more = document.createElement('a');
        more.className = 'today-all';
        // The calendar reads both parts, so a filtered view carries through
        // rather than dumping the reader into every sport on that date.
        more.href = 'calendar.html#' + selected + (sport ? '/' + encodeURIComponent(sport) : '');
        more.textContent = list.length > GAME_ROWS
            ? 'See all ' + list.length + (sport ? ' ' + sport : '') + ' games'
            : 'Open this day in the full calendar';
        panel.appendChild(more);
    }

    function sportPill(label, value, count) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'today-sport' + (sport === value ? ' is-on' : '');
        b.setAttribute('aria-pressed', sport === value ? 'true' : 'false');
        b.appendChild(document.createTextNode(label));

        var c = document.createElement('b');
        c.textContent = count;
        b.appendChild(c);

        b.addEventListener('click', function () {
            // Clicking the sport already showing turns the filter off, so the
            // pill works as a toggle and there is always a way back.
            sport = (sport === value) ? '' : value;
            showDay();
        });
        return b;
    }

    function buildRow(g) {
        var row = document.createElement('div');
        row.className = 'today-game' + (g.status ? ' is-off' : '');

        var t = document.createElement('span');
        t.className = 'today-time';
        t.textContent = g.timeLabel || 'TBA';
        row.appendChild(t);

        var mid = document.createElement('span');
        mid.className = 'today-match';

        var teams = document.createElement('strong');
        var vs = g.home === true ? ' vs ' : g.home === false ? ' at ' : ' v ';
        teams.textContent = g.school + (g.opponent ? vs + g.opponent : '');
        mid.appendChild(teams);

        var meta = document.createElement('span');
        meta.className = 'today-meta';
        meta.textContent = [g.level, g.gender, g.sport].filter(Boolean).join(' · ');
        mid.appendChild(meta);

        row.appendChild(mid);

        if (g.status) {
            var s = document.createElement('span');
            s.className = 'today-status';
            s.textContent = g.status;
            row.appendChild(s);
        }
        return row;
    }
});
