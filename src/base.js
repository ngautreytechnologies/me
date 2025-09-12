document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.section-card');
    cards.forEach(card => {
        card.style.animationPlayState = 'paused';
        observer.observe(card);
    });

    window.addEventListener("scroll", () => {
        const navbar = document.getElementById("navbar");
        const brand = navbar.querySelector(".nav-brand");

        if (window.scrollY > 0) {
            navbar.classList.add("scrolled");
            brand.classList.remove("hidden"); // show brand when scrolled
        } else {
            navbar.classList.remove("scrolled");
            brand.classList.add("hidden"); // hide brand at top
        }
    });

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const offset = 70; // navbar height

    // Smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            // Prevent default anchor behavior
            e.preventDefault();
            // Get target section and scroll to it
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
            // Remove active from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active to clicked link
            link.classList.add('active');
        });
    });

    // Scroll spy
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - offset - 5;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
    });

    const firstCard = document.querySelector('.philosophy-card');
    const firstDetail = document.getElementById('philosophy-details');

    if (firstCard && firstDetail) {
        firstCard.classList.add('active');
        firstDetail.classList.add('active');
    }

    // Tab switching (same as before)
    const tabs = document.querySelectorAll('.expertise-tabs .tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

});
