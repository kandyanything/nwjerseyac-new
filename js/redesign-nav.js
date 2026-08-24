// Mobile navigation for the redesign.
//
// Two things it has to get right, both of which it previously got wrong.
//
// Whether the menu is collapsed is a question for the stylesheet, not a number
// repeated here. The CSS breakpoint moved from 900px to 1120px and this file
// kept the old figure, so between the two the menu collapsed to a hamburger
// while the script still believed it was on a desktop - and tapping a parent
// like "Conference" followed its own link instead of revealing the submenu
// beneath it. Reading the toggle's own computed display cannot drift.
//
// And the menu has to get out of the way once a link is followed. An in-page
// anchor does not reload the page, so an open menu stays open on top of the
// section it just jumped to. On a phone the open menu is around 612px tall
// against an 844px screen, which is why the Athletic Directors listing looked
// like it simply was not there.
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.nav-toggle');
    var list = document.getElementById('primary-menu');
    if (!toggle || !list) return;

    function collapsed() {
        return getComputedStyle(toggle).display !== 'none';
    }

    function close() {
        list.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        list.querySelectorAll('.has-sub.open').forEach(function (li) {
            li.classList.remove('open');
        });
    }

    toggle.addEventListener('click', function () {
        if (list.classList.contains('open')) { close(); return; }
        list.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
    });

    list.querySelectorAll('a').forEach(function (link) {
        var parent = link.parentElement;
        var isParent = parent.classList.contains('has-sub') && !!parent.querySelector('.subnav');

        link.addEventListener('click', function (e) {
            if (!collapsed()) return;

            // A parent reveals its submenu on the first tap rather than
            // navigating; a second tap follows the link as normal.
            if (isParent && !parent.classList.contains('open')) {
                e.preventDefault();
                parent.classList.add('open');
                return;
            }
            if (isParent) return;

            // A real destination. Close before the browser acts on the link, so
            // an in-page jump lands against a collapsed menu rather than behind
            // an open one.
            close();
        });
    });

    // Returning to a wide layout should not leave a collapsed menu's state
    // stranded on the desktop bar.
    window.addEventListener('resize', function () {
        if (!collapsed()) close();
    });
});
