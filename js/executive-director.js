// Executive Director posting (executive-director.html): a live countdown to
// the deadline in data-closes on .ed-post. Once it passes, the status reads
// "Applications closed", the countdown and Apply button go away and the
// closed note shows.
document.addEventListener('DOMContentLoaded', function () {
    var post = document.querySelector('.ed-post');
    if (!post) return;
    var closes = new Date(post.getAttribute('data-closes')).getTime();
    if (isNaN(closes)) return;
    var nums = {};
    [].forEach.call(post.querySelectorAll('.ed-num'), function (n) { nums[n.getAttribute('data-unit')] = n; });

    function pad(v) { return (v < 10 ? '0' : '') + v; }
    function closed() {
        post.classList.add('is-closed');
        var t = post.querySelector('.ed-status-text'); if (t) t.textContent = 'Applications closed';
        [].forEach.call(post.querySelectorAll('.ed-clock, .ed-apply, .ed-note'), function (el) { el.hidden = true; });
        var c = post.querySelector('.ed-closed'); if (c) c.hidden = false;
    }
    function tick() {
        var left = closes - Date.now();
        if (left <= 0) { clearInterval(timer); closed(); return; }
        var v = { d: Math.floor(left / 864e5), h: Math.floor(left / 36e5) % 24, m: Math.floor(left / 6e4) % 60, s: Math.floor(left / 1e3) % 60 };
        Object.keys(v).forEach(function (k) { if (nums[k]) nums[k].textContent = pad(v[k]); });
    }
    var timer = setInterval(tick, 1000);
    tick();
});
