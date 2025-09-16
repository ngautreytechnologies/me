// globals.js
// Handles global CSS, floating particles, section card animations, tabs, and smooth scroll outside navbar

import resetCss from './styles/reset.css';
import globalsCss from './styles/globals.css';
import animationsCss from './styles/animations.css';
import typographyCss from './styles/typography.css';

// -----------------------
// Combine CSS for constructible sheets or <style> fallback
// -----------------------
export const GLOBAL_STYLES = [resetCss, globalsCss, animationsCss, typographyCss]
    .filter(Boolean)
    .join('\n');

export const GLOBAL_SHEETS =
    (typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype)
        ? (() => {
            try {
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(GLOBAL_STYLES);
                return [sheet];
            } catch (err) {
                console.warn('GLOBAL_SHEETS: failed to create constructible sheet', err);
                return [];
            }
        })()
        : [];

let _globalInjected = false;
export function ensureGlobalStyleInjected() {
    if (GLOBAL_SHEETS.length || _globalInjected) return;

    const existing = document.getElementById('global-styles');
    if (existing) {
        console.log('Global styles already injected');
        _globalInjected = true;
        return;
    }
    console.log('Injecting global styles via <style> fallback');
    const el = document.createElement('style');
    el.id = 'global-styles';
    el.textContent = GLOBAL_STYLES;
    document.head.appendChild(el);
    _globalInjected = true;
}

// -----------------------
// Helpers
// -----------------------
export const throttle = (fn, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// -----------------------
// Floating Particles
// -----------------------
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

// -----------------------
// DOMContentLoaded Setup
// -----------------------
document.addEventListener('DOMContentLoaded', () => {
    ensureGlobalStyleInjected();
    initFloatingParticles();

    // -----------------------
    // Section card animations (IntersectionObserver)
    // -----------------------
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
    // -----------------------
    // Expertise tabs
    // -----------------------
    const tabs = document.querySelectorAll('.expertise-tabs .tab');
    const panels = document.querySelectorAll('.tab-panel');

    if (tabs.length && panels.length) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                const panel = document.getElementById(tab.dataset.tab);
                if (panel) panel.classList.add('active');
            });
        });
    }
});
