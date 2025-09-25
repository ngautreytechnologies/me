/**
 * Sets up navigation bar behavior including scroll effects, smooth scrolling, and scroll spy.
 * @returns void
 */
export function setupNavigation() {
    const navbar = document.getElementById("navbar");
    const brand = navbar.querySelector(".nav-brand");
    const icons = navbar.querySelector(".nav-icons");
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");
    const offset = 70; // navbar height

    const handleScroll = () => {
        if (window.scrollY > 0) {
            // Add scrolled class for frosted background
            navbar.classList.add("scrolled");

            // Show brand (fade in)
            brand.classList.remove("hidden");

            // Show icons (fade + expand)
            icons.classList.add("visible");
        } else {
            // Remove scrolled background
            navbar.classList.remove("scrolled");

            // Hide brand (fade out)
            brand.classList.add("hidden");

            // Hide icons (fade + shrink)
            icons.classList.remove("visible");
        }
    };

    // Run once on load
    handleScroll();

    // Scroll listener
    window.addEventListener("scroll", handleScroll);

    // Smooth scroll on nav-link click
    navLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - offset,
                    behavior: "smooth",
                });
            }
            // Update active state
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });

    // Scroll spy (update active link based on section in view)
    const handleScrollSpy = () => {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - offset - 5;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute("id");
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${current}`
            );
        });
    };
    window.addEventListener("scroll", handleScrollSpy);
}
