// Conference Schedule: a month grid, click a day to see every NJAC game that
// day in chronological order.
//
// Loads data/schedule/index.json for the grid (small - just which dates have
// games and how many), then data/schedule/YYYY-MM.json for the month being
// viewed. The combined file is several megabytes, so it is never loaded.
document.addEventListener('DOMContentLoaded', function () {
    var root = document.querySelector('.njac-schedule');
    if (!root) return;

    var grid = root.querySelector('.cal-grid');
    var title = root.querySelector('.cal-title');
    var prev = root.querySelector('.cal-prev');
    var next = root.querySelector('.cal-next');
    var dayPanel = root.querySelector('.cal-day');
    var sportSel = root.querySelector('.cal-sport');
    var stamp = root.querySelector('.cal-updated');

    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
    var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    var index = null;
    var monthCache = {};
    var viewMonth = null;      // 'YYYY-MM'
    var selectedDate = null;   // 'YYYY-MM-DD'
    var sportFilter = '';

    fetch('data/schedule/index.json')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (data) {
            index = data;
            if (!index.months || !index.months.length) { root.style.display = 'none'; return; }

            if (stamp && index.generated) {
                var d = new Date(index.generated);
                stamp.textContent = 'Updated ' + d.toLocaleDateString('en-US',
                    { month: 'short', day: 'numeric', year: 'numeric' });
            }
            if (sportSel && index.sports) {
                index.sports.forEach(function (s) {
                    var o = document.createElement('option');
                    o.value = s; o.textContent = s;
                    sportSel.appendChild(o);
                });
                sportSel.addEventListener('change', function () {
                    sportFilter = sportSel.value;
                    if (selectedDate) showDay(selectedDate);
                });
            }

            viewMonth = defaultMonth();
            renderMonth();
        })
        .catch(function () { root.style.display = 'none'; });

    // open on the current month if it has games, otherwise the first month that does
    function defaultMonth() {
        var now = new Date();
        var cur = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        return index.months.indexOf(cur) !== -1 ? cur : index.months[0];
    }

    function shiftMonth(month, delta) {
        var y = Number(month.slice(0, 4)), m = Number(month.slice(5, 7)) - 1 + delta;
        var d = new Date(y, m, 1);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    }

    function renderMonth() {
        var y = Number(viewMonth.slice(0, 4)), m = Number(viewMonth.slice(5, 7)) - 1;
        title.textContent = MONTHS[m] + ' ' + y;

        var i = index.months.indexOf(viewMonth);
        prev.disabled = i <= 0;
        next.disabled = i === -1 || i >= index.months.length - 1;

        grid.innerHTML = '';
        DOW.forEach(function (d) {
            var h = document.createElement('div');
            h.className = 'cal-dow';
            h.textContent = d;
            grid.appendChild(h);
        });

        var first = new Date(y, m, 1);
        var daysIn = new Date(y, m + 1, 0).getDate();
        for (var b = 0; b < first.getDay(); b++) {
            grid.appendChild(Object.assign(document.createElement('div'), { className: 'cal-cell is-empty' }));
        }
        for (var day = 1; day <= daysIn; day++) {
            var date = viewMonth + '-' + String(day).padStart(2, '0');
            var n = index.dateCounts[date] || 0;

            var cell = document.createElement(n ? 'button' : 'div');
            cell.className = 'cal-cell' + (n ? '' : ' is-quiet') + (date === selectedDate ? ' is-selected' : '');
            if (n) {
                cell.type = 'button';
                cell.setAttribute('aria-label', n + ' games on ' + date);
                cell.dataset.date = date;
                cell.addEventListener('click', function () { showDay(this.dataset.date); });
            }
            var num = document.createElement('span');
            num.className = 'cal-num';
            num.textContent = day;
            cell.appendChild(num);
            if (n) {
                var tag = document.createElement('span');
                tag.className = 'cal-count';
                tag.textContent = n;
                cell.appendChild(tag);
            }
            grid.appendChild(cell);
        }
    }

    function loadMonth(month) {
        if (monthCache[month]) return Promise.resolve(monthCache[month]);
        return fetch('data/schedule/' + month + '.json')
            .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
            .then(function (d) { monthCache[month] = d.games || []; return monthCache[month]; });
    }

    function showDay(date) {
        selectedDate = date;
        renderMonth();
        dayPanel.innerHTML = '<p class="cal-loading">Loading…</p>';

        loadMonth(date.slice(0, 7)).then(function (games) {
            var list = games.filter(function (g) { return g.date === date; });
            if (sportFilter) list = list.filter(function (g) { return g.sport === sportFilter; });

            dayPanel.innerHTML = '';
            var h3 = document.createElement('h3');
            var d = new Date(date + 'T12:00:00');
            h3.textContent = d.toLocaleDateString('en-US',
                { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            dayPanel.appendChild(h3);

            var sub = document.createElement('p');
            sub.className = 'cal-daycount';
            sub.textContent = list.length + (list.length === 1 ? ' game' : ' games')
                + (sportFilter ? ' — ' + sportFilter : '');
            dayPanel.appendChild(sub);

            if (!list.length) {
                var none = document.createElement('p');
                none.className = 'cal-none';
                none.textContent = sportFilter
                    ? 'No ' + sportFilter + ' games scheduled this day.'
                    : 'No games scheduled this day.';
                dayPanel.appendChild(none);
                return;
            }

            var table = document.createElement('div');
            table.className = 'cal-games';
            list.forEach(function (g) { table.appendChild(buildRow(g)); });
            dayPanel.appendChild(table);
        }).catch(function () {
            dayPanel.innerHTML = '<p class="cal-none">That month could not be loaded.</p>';
        });
    }

    function buildRow(g) {
        var row = document.createElement('div');
        row.className = 'cal-game' + (g.status ? ' is-off' : '');

        var t = document.createElement('span');
        t.className = 'cal-time';
        t.textContent = g.timeLabel || 'TBA';
        row.appendChild(t);

        var mid = document.createElement('span');
        mid.className = 'cal-match';
        var teams = document.createElement('strong');
        var vs = g.home === true ? ' vs ' : g.home === false ? ' at ' : ' v ';
        teams.textContent = g.school + (g.opponent ? vs + g.opponent : '');
        mid.appendChild(teams);

        var meta = document.createElement('span');
        meta.className = 'cal-meta';
        meta.textContent = [g.level, g.gender, g.sport].filter(Boolean).join(' · ');
        mid.appendChild(meta);
        row.appendChild(mid);

        if (g.status) {
            var s = document.createElement('span');
            s.className = 'cal-status';
            s.textContent = g.status;
            row.appendChild(s);
        }
        return row;
    }

    prev.addEventListener('click', function () {
        viewMonth = shiftMonth(viewMonth, -1);
        renderMonth();
    });
    next.addEventListener('click', function () {
        viewMonth = shiftMonth(viewMonth, 1);
        renderMonth();
    });
});
