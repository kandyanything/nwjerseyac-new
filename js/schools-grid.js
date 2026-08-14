// Load and display schools in a grid
document.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.getElementById('schools-grid');

    if (!gridContainer) return; // Exit if not on homepage

    // School data embedded directly (to work locally without fetch)
    const schools = [
        {"name": "Academy of Saint Elizabeth", "logo": "academy-saint-elizabeth.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=100"},
        {"name": "Boonton High School", "logo": "boonton.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=2189"},
        {"name": "Butler High School", "logo": "butler.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=2819"},
        {"name": "Chatham High School", "logo": "chatham.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=3996"},
        {"name": "Delbarton School", "logo": "delbarton.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=5756"},
        {"name": "Dover High School", "logo": "dover.png", "arbiterUrl": ""},
        {"name": "Hackettstown High School", "logo": "hackettstown.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=9254"},
        {"name": "Hanover Park High School", "logo": "hanover-park.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=9430"},
        {"name": "High Point High School", "logo": "high-point.png", "arbiterUrl": "https://65901.digitalsports.com/pages/schedule/schedule.php"},
        {"name": "Hopatcong High School", "logo": "hopatcong.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=10426"},
        {"name": "Jefferson Township High School", "logo": "jefferson.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=11226"},
        {"name": "Kinnelon High School", "logo": "kinnelon.png", "arbiterUrl": "https://76325.digitalsports.com/pages/schedule/schedule.php"},
        {"name": "Kittatinny High School", "logo": "kittatinny.png", "arbiterUrl": "https://kittatinnyregional.digitalsports.com/"},
        {"name": "Lenape Valley High School", "logo": "lenape-valley.png", "arbiterUrl": "https://75983.digitalsports.com/pages/schedule/schedule.php"},
        {"name": "Madison High School", "logo": "madison.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=13538"},
        {"name": "Montville High School", "logo": "montville.png", "arbiterUrl": "https://www.arbiterlive.com/School/Calendar/15106"},
        {"name": "Morris Catholic High School", "logo": "morris-catholic.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15182"},
        {"name": "Morris County School of Technology", "logo": "morris-county-school-of-technology.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15185"},
        {"name": "Morris Hills High School", "logo": "morris-hills.png", "arbiterUrl": "https://www.arbiterlive.com/School/15188"},
        {"name": "Morris Knolls High School", "logo": "morris-knolls.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15189"},
        {"name": "Morristown Beard School", "logo": "morristown-beard.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15200"},
        {"name": "Morristown High School", "logo": "morristown.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15198"},
        {"name": "Mount Olive High School", "logo": "mount-olive.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15450"},
        {"name": "Mountain Lakes High School", "logo": "mountain-lakes.png", "arbiterUrl": "https://51599.digitalsports.com/pages/schedule/schedule.php"},
        {"name": "Newton High School", "logo": "newton.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=15980"},
        {"name": "North Warren", "logo": "north-warren.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=16405"},
        {"name": "Parsippany High School", "logo": "parsippany.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=17620"},
        {"name": "Parsippany Hills High School", "logo": "parsippany-hills.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=17621"},
        {"name": "Pequannock High School", "logo": "pequannock.png", "arbiterUrl": "https://www.arbiterlive.com/School/Calendar/17870"},
        {"name": "Pope John XXIII High School", "logo": "pope-john.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=18382"},
        {"name": "Randolph Township School District", "logo": "randolph.png", "arbiterUrl": "https://randolphathletics.digitalsports.com/pages/calendar/schedule.php"},
        {"name": "Roxbury High School", "logo": "roxbury.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=19753"},
        {"name": "Sparta High School", "logo": "sparta.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=21689"},
        {"name": "Sussex County Tech High School", "logo": "sussex-county-school-of-technology.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=22806"},
        {"name": "Vernon Township High School", "logo": "vernon.png", "arbiterUrl": "https://56295.digitalsports.com/"},
        {"name": "Villa Walsh Academy", "logo": "villa-walsh.png", "arbiterUrl": "https://villawalsh.digitalsports.com/pages/schedule/schedule.php"},
        {"name": "Wallkill Valley High School", "logo": "wallkill-valley.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=24648"},
        {"name": "West Morris Central", "logo": "west-morris-central.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=25317"},
        {"name": "West Morris Mendham", "logo": "west-morris-mendham.png", "arbiterUrl": "https://arbiterlive.com/Teams?entityId=14434"},
        {"name": "Whippany Park High School", "logo": "whippany-park.png", "arbiterUrl": "https://wpathletics.digitalsports.com/pages/calendar/schedule.php"}
    ];

    // Function to generate initials from school name
    function getInitials(name) {
        // Remove common words like "High School", "School", "Township", etc.
        const cleanName = name
            .replace(/High School/gi, '')
            .replace(/School/gi, '')
            .replace(/Township/gi, '')
            .replace(/District/gi, '')
            .trim();

        // Get first letters of remaining words
        const words = cleanName.split(' ').filter(word => word.length > 0);

        if (words.length === 1) {
            // For single words, take first 2-3 letters
            return words[0].substring(0, Math.min(3, words[0].length)).toUpperCase();
        } else {
            // For multiple words, take first letter of each (max 3)
            return words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
        }
    }

    // Alternate background colors for variety
    const colors = [
        '#002B5C', // Primary navy
        '#003d82', // Secondary navy
        '#1e3a8a', // Darker blue
        '#1e40af', // Medium blue
        '#2563eb'  // Lighter blue
    ];

    // Create school items
    schools.forEach((school, index) => {
        const schoolItem = document.createElement('a');
        schoolItem.className = 'school-item';

        // Use Arbiter Live URL if available
        if (school.arbiterUrl) {
            schoolItem.href = school.arbiterUrl;
            schoolItem.target = '_blank';
            schoolItem.rel = 'noopener';
        } else {
            schoolItem.href = '#';
            schoolItem.onclick = function(e) {
                e.preventDefault();
                alert(school.name + ' - Schedule coming soon!');
            };
        }

        // Get initials and color for this school
        const initials = getInitials(school.name);
        const bgColor = colors[index % colors.length];

        // Use logo if available, otherwise use colored indicator
        if (school.logo) {
            schoolItem.innerHTML = `
                <img src="images/logos/${school.logo}" alt="${school.name}" class="school-grid-logo">
                <div class="school-info">
                    <div class="school-name-compact">${school.name}</div>
                    <div class="school-action">${school.arbiterUrl ? 'View Athletic Schedules' : 'Coming Soon'}</div>
                </div>
            `;
        } else {
            schoolItem.innerHTML = `
                <div class="school-indicator" style="background: ${bgColor};"></div>
                <div class="school-info">
                    <div class="school-name-compact">${school.name}</div>
                    <div class="school-action">${school.arbiterUrl ? 'View Athletic Schedules' : 'Coming Soon'}</div>
                </div>
            `;
        }

        gridContainer.appendChild(schoolItem);
    });
});
