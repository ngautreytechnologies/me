import templateHtml from './navbar.html';
import BaseLightComponent from '../base-light-component.js';
import { throttle } from '../../globals.js';
import css from './navbar.css';

class Navbar extends BaseLightComponent {
    constructor() {
        super(templateHtml, css); // Inject HTML into Light DOM

        this.scrollThreshold = 100;
        this.isScrolled = false;
        this.activeSection = '';

        // Bind handlers
        this.handleScroll = this.handleScroll.bind(this);
        this.handleScrollSpy = this.handleScrollSpy.bind(this);
        this.handleNavClick = this.handleNavClick.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        this.initNavbar();

        requestAnimationFrame(() => {
            this.setupScrollListeners();
        });
    }

    disconnectedCallback() {
        this.removeScrollListeners();
    }

    initNavbar() {
        this.navbar = this.querySelector('.navbar');
        this.brand = this.querySelector('.nav-brand');
        this.navLinks = Array.from(this.querySelectorAll('.nav-link'));

        if (!this.navbar || !this.brand || !this.navLinks.length) {
            console.warn('[Navbar] Missing required elements');
            return;
        }

        // Attach click handlers
        this.navLinks.forEach(link => link.addEventListener('click', this.handleNavClick));

        this.updateNavbarState();
    }

    setupScrollListeners() {
        this.throttledScrollHandler = throttle(this.handleScroll, 16); // ~60fps
        this.throttledScrollSpy = throttle(this.handleScrollSpy, 100);

        window.addEventListener('scroll', this.throttledScrollHandler, { passive: true });
        window.addEventListener('scroll', this.throttledScrollSpy, { passive: true });

        // Initial state
        this.handleScroll();
        this.handleScrollSpy();
    }

    removeScrollListeners() {
        window.removeEventListener('scroll', this.throttledScrollHandler);
        window.removeEventListener('scroll', this.throttledScrollSpy);
    }

    handleScroll() {
        if (!this.navbar || !this.brand) return;

        const scrollY = window.scrollY;
        const shouldBeScrolled = scrollY > this.scrollThreshold;

        if (shouldBeScrolled !== this.isScrolled) {
            this.isScrolled = shouldBeScrolled;
            this.navbar.classList.toggle('scrolled', this.isScrolled);
            this.brand.classList.toggle('visible', this.isScrolled);
        }
    }

    handleScrollSpy() {
        if (!this.navLinks) return;

        const sections = document.querySelectorAll('main > .section-card[id]');
        if (!sections.length) return;

        const scrollY = window.scrollY;
        const offset = this.scrollThreshold + 20;
        let currentSection = '';

        sections.forEach(section => {
            const top = section.offsetTop - offset;
            const bottom = top + section.offsetHeight;
            if (scrollY >= top && scrollY < bottom) currentSection = section.id;
        });

        if (scrollY < offset && sections.length) currentSection = sections[0].id;

        if (currentSection && currentSection !== this.activeSection) {
            this.updateActiveLink(currentSection);
            this.activeSection = currentSection;
        }
    }

    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href')?.slice(1);
        if (!targetId) return;

        const target = document.getElementById(targetId);
        if (!target) return;

        const targetTop = target.offsetTop - (this.scrollThreshold + 10);
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

        this.updateActiveLink(targetId);
        this.activeSection = targetId;
    }

    updateActiveLink(sectionId) {
        this.navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });
    }

    updateNavbarState() {
        requestAnimationFrame(() => {
            this.handleScroll();
            this.handleScrollSpy();
        });
    }
}

customElements.define('navigation-bar', Navbar);
