// NJAC Leadership: the conference's executive officers.
// Hides itself if leadership.json is empty, like the other data-driven sections.
document.addEventListener('DOMContentLoaded', function () {
    var section = document.querySelector('.njac-leadership');
    if (!section) return;

    var grid = section.querySelector('.leadership-grid');
    if (!grid) return;

    fetch('data/leadership.json')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (data) {
            var people = (data.leadership || []).filter(function (p) { return p && p.name && p.role; });
            if (!people.length) { section.style.display = 'none'; return; }
            people.forEach(function (p) { grid.appendChild(buildCard(p)); });
        })
        .catch(function () { section.style.display = 'none'; });

    function buildCard(p) {
        var card = document.createElement('article');
        card.className = 'leader-card';

        var role = document.createElement('p');
        role.className = 'leader-role';
        role.textContent = p.role;
        card.appendChild(role);

        var h3 = document.createElement('h3');
        h3.textContent = p.name;
        card.appendChild(h3);

        if (p.school) {
            var sch = document.createElement('p');
            sch.className = 'leader-school';
            sch.textContent = p.school;
            card.appendChild(sch);
        }

        if (p.email || p.phone) {
            var contact = document.createElement('p');
            contact.className = 'leader-contact';
            if (p.email) {
                var mail = document.createElement('a');
                mail.href = 'mailto:' + p.email;
                mail.textContent = p.email;
                contact.appendChild(mail);
            }
            if (p.email && p.phone) contact.appendChild(document.createElement('br'));
            if (p.phone) {
                var tel = document.createElement('a');
                tel.href = 'tel:' + p.phone.replace(/[^0-9+]/g, '');
                tel.textContent = p.phone;
                contact.appendChild(tel);
            }
            card.appendChild(contact);
        }
        return card;
    }
});
