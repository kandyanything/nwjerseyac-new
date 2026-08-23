// Mobile navigation for the redesign: the menu button toggles the list, and on
// touch layouts a parent with a submenu opens it on first tap instead of
// following its own link straight away.
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.nav-toggle');
    var list = document.getElementById('primary-menu');
    if (!toggle || !list) return;

    toggle.addEventListener('click', function () {
        var open = list.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    var mobile = window.matchMedia('(max-width: 900px)');
    document.querySelectorAll('.has-sub > a').forEach(function (link) {
        link.addEventListener('click', function (e) {
            if (!mobile.matches) return;
            var li = link.parentElement;
            if (!li.classList.contains('open')) {
                e.preventDefault();
                li.classList.add('open');
            }
        });
    });
});
