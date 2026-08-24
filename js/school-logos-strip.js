// Populate school logos strip at top (BigTen style)
document.addEventListener('DOMContentLoaded', function() {
    const logosContainer = document.getElementById('school-logos-strip');

    if (!logosContainer) return;

    // School data
    const schools = [
        {"name": "Academy of Saint Elizabeth", "short": "ASE", "logo": "academy-saint-elizabeth.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=100"},
        {"name": "Boonton High School", "short": "BOO", "logo": "boonton.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=2189"},
        {"name": "Butler High School", "short": "BUT", "logo": "butler.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=2819"},
        {"name": "Chatham High School", "short": "CHS", "logo": "chatham.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=3996"},
        {"name": "Delbarton School", "short": "DEL", "logo": "delbarton.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=5756"},
        {"name": "Dover High School", "short": "DOV", "logo": "dover.png", "arbiterUrl": ""},
        {"name": "Hackettstown High School", "short": "HAC", "logo": "hackettstown.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=9254"},
        {"name": "Hanover Park High School", "short": "HP", "logo": "hanover-park.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=9430"},
        {"name": "High Point High School", "short": "HPT", "logo": "high-point.png", "arbiterUrl": "https://65901.digitalsports.com/pages/schedule/schedule.php"},
        {"name": "Hopatcong High School", "short": "HOP", "logo": "hopatcong.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=10426"},
        {"name": "Jefferson Township High School", "short": "JEF", "logo": "jefferson.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=11226"},
        {"name": "Kinnelon High School", "short": "KIN", "logo": "kinnelon.png", "arbiterUrl": "https://76325.digitalsports.com/pages/schedule/schedule.php"},
        {"name": "Kittatinny High School", "short": "KIT", "logo": "kittatinny.png", "arbiterUrl": "https://kittatinnyregional.digitalsports.com/"},
        {"name": "Lenape Valley High School", "short": "LV", "logo": "lenape-valley.png", "arbiterUrl": "https://75983.digitalsports.com/pages/schedule/schedule.php"},
        {"name": "Madison High School", "short": "MAD", "logo": "madison.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=13538"},
        {"name": "Montville High School", "short": "MON", "logo": "montville.png", "arbiterUrl": "https://www.arbiterlive.com/School/Calendar/15106"},
        {"name": "Morris Catholic High School", "short": "MC", "logo": "morris-catholic.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15182"},
        {"name": "Morris County School of Technology", "short": "MCT", "logo": "morris-county-school-of-technology.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15185"},
        {"name": "Morris Hills High School", "short": "MH", "logo": "morris-hills.png", "arbiterUrl": "https://www.arbiterlive.com/School/15188"},
        {"name": "Morris Knolls High School", "short": "MK", "logo": "morris-knolls.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15189"},
        {"name": "Morristown Beard School", "short": "MB", "logo": "morristown-beard.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15200"},
        {"name": "Morristown High School", "short": "MOR", "logo": "morristown.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15198"},
        {"name": "Mount Olive High School", "short": "MO", "logo": "mount-olive.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15450"},
        {"name": "Mountain Lakes High School", "short": "ML", "logo": "mountain-lakes.png", "arbiterUrl": "https://51599.digitalsports.com/pages/schedule/schedule.php"},
        {"name": "Newton High School", "short": "NEW", "logo": "newton.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15980"},
        {"name": "North Warren", "short": "NW", "logo": "north-warren.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=16405"},
        {"name": "Parsippany High School", "short": "PAR", "logo": "parsippany.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=17620"},
        {"name": "Parsippany Hills High School", "short": "PH", "logo": "parsippany-hills.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=17621"},
        {"name": "Pequannock High School", "short": "PEQ", "logo": "pequannock.png", "arbiterUrl": "https://www.arbiterlive.com/School/Calendar/17870"},
        {"name": "Pope John XXIII High School", "short": "PJ", "logo": "pope-john.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=18382"},
        {"name": "Randolph Township School District", "short": "RAN", "logo": "randolph.png", "arbiterUrl": "https://randolphathletics.digitalsports.com/pages/calendar/schedule.php"},
        {"name": "Roxbury High School", "short": "ROX", "logo": "roxbury.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=19753"},
        {"name": "Sparta High School", "short": "SPA", "logo": "sparta.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=21689"},
        {"name": "Sussex County Tech High School", "short": "SCT", "logo": "sussex-county-school-of-technology.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=22806"},
        {"name": "Vernon Township High School", "short": "VER", "logo": "vernon.png", "arbiterUrl": "https://56295.digitalsports.com/"},
        {"name": "Villa Walsh Academy", "short": "VW", "logo": "villa-walsh.png", "arbiterUrl": "https://villawalsh.digitalsports.com/pages/schedule/schedule.php"},
        {"name": "Wallkill Valley High School", "short": "WAL", "logo": "wallkill-valley.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=24648"},
        {"name": "West Morris Central", "short": "WMC", "logo": "west-morris-central.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=25317"},
        {"name": "West Morris Mendham", "short": "WMM", "logo": "west-morris-mendham.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=14434"},
        {"name": "Whippany Park High School", "short": "WHP", "logo": "whippany-park.png", "arbiterUrl": "https://wpathletics.digitalsports.com/pages/calendar/schedule.php"}
    ];

    // Background colors for variety
    const colors = [
        '#002B5C', '#003d82', '#1e3a8a', '#1e40af', '#2563eb',
        '#1d4ed8', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa'
    ];

    // Create scroll track for seamless scrolling
    const scrollTrack = document.createElement('div');
    scrollTrack.className = 'logos-scroll-track';

    // Function to create logo items
    function createLogoItem(school, index) {
        const logoItem = document.createElement('a');
        logoItem.className = 'strip-logo-item';
        logoItem.title = school.name;

        // Link to Arbiter if available
        if (school.arbiterUrl) {
            logoItem.href = school.arbiterUrl;
            logoItem.target = '_blank';
            logoItem.rel = 'noopener';
        } else {
            logoItem.href = '#';
            logoItem.onclick = function(e) {
                e.preventDefault();
            };
        }

        const bgColor = colors[index % colors.length];

        // Use real logo if available, otherwise use placeholder circle
        if (school.logo) {
            logoItem.innerHTML = `
                <img src="images/logos/${school.logo}"
                     alt="${school.name}"
                     class="strip-logo-img"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="strip-logo-circle" style="background: ${bgColor}; display: none;">
                    ${school.short}
                </div>
            `;
        } else {
            logoItem.innerHTML = `
                <div class="strip-logo-circle" style="background: ${bgColor};">
                    ${school.short}
                </div>
            `;
        }

        return logoItem;
    }

    // Create logo items (duplicate for seamless scrolling)
    schools.forEach((school, index) => {
        scrollTrack.appendChild(createLogoItem(school, index));
    });

    // Duplicate logos for seamless infinite scroll
    schools.forEach((school, index) => {
        scrollTrack.appendChild(createLogoItem(school, index));
    });

    logosContainer.appendChild(scrollTrack);
});
