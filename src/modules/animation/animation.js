/**
 * Initializes floating binary particles animation.
 * @returns void
 */
export function initFloatingParticles() {
    const container = document.getElementById('floating-elements');
    if (!container) return;

    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];
    const particleCount = 15;

    const createParticle = () => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = Math.random() > 0.5 ? '1' : '0';
        particle.style.color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 7 + 8) + 's';
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 24000);
    };

    for (let i = 0; i < particleCount; i++) {
        setTimeout(createParticle, i * 200);
    }
    setInterval(createParticle, 400);
}

/**
 * Sets up section card animations using IntersectionObserver.
 * @returns void
 */
export function setupSectionCardAnimations() {
    // Section card animations
    const cards = document.querySelectorAll('.section-card');
    if (cards.length) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    obs.unobserve(entry.target); // stop observing once animated
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        cards.forEach(card => {
            card.style.animationPlayState = 'paused';
            observer.observe(card);
        });
    }
}