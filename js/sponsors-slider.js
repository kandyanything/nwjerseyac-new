// Sponsors Slider with Auto-advance
document.addEventListener('DOMContentLoaded', function() {
    const sponsorItems = document.querySelectorAll('.sponsor-item');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const sponsorsSlider = document.querySelector('.sponsors-slider');

    if (!sponsorItems.length) return; // Exit if no sponsor items

    let currentSlide = 0;
    let autoAdvanceInterval;
    let isAutoAdvanceActive = true;

    // Function to show specific slide
    function showSlide(index) {
        // Remove active class from all items and dots
        sponsorItems.forEach(item => item.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to current item and dot
        sponsorItems[index].classList.add('active');
        dots[index].classList.add('active');

        currentSlide = index;
    }

    // Function to go to next slide
    function nextSlide() {
        let next = (currentSlide + 1) % sponsorItems.length;
        showSlide(next);
    }

    // Function to go to previous slide
    function prevSlide() {
        let prev = (currentSlide - 1 + sponsorItems.length) % sponsorItems.length;
        showSlide(prev);
    }

    // Start auto-advance
    function startAutoAdvance() {
        if (isAutoAdvanceActive) {
            autoAdvanceInterval = setInterval(nextSlide, 5000); // Advance every 5 seconds
        }
    }

    // Stop auto-advance
    function stopAutoAdvance() {
        clearInterval(autoAdvanceInterval);
    }

    // Restart auto-advance
    function restartAutoAdvance() {
        stopAutoAdvance();
        startAutoAdvance();
    }

    // Next button click
    nextBtn.addEventListener('click', function() {
        nextSlide();
        restartAutoAdvance(); // Restart the timer after manual navigation
    });

    // Previous button click
    prevBtn.addEventListener('click', function() {
        prevSlide();
        restartAutoAdvance(); // Restart the timer after manual navigation
    });

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            showSlide(index);
            restartAutoAdvance(); // Restart the timer after manual navigation
        });
    });

    // Pause auto-advance on hover
    sponsorsSlider.addEventListener('mouseenter', function() {
        stopAutoAdvance();
    });

    // Resume auto-advance when mouse leaves
    sponsorsSlider.addEventListener('mouseleave', function() {
        startAutoAdvance();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            restartAutoAdvance();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            restartAutoAdvance();
        }
    });

    // Initialize: show first slide and start auto-advance
    showSlide(0);
    startAutoAdvance();

    // Pause auto-advance when tab is not visible (performance optimization)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            isAutoAdvanceActive = false;
            stopAutoAdvance();
        } else {
            isAutoAdvanceActive = true;
            startAutoAdvance();
        }
    });
});
