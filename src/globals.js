/**
 * globals.js
 * 
 * This file sets up global styles, animations, and navigation behavior for the portfolio website.
 */

import { initFloatingParticles, setupSectionCardAnimations } from './utils/animations';
import { setupNavigation } from './utils/navigation';
import { ensureGlobalStyleInjected } from './utils/styles';

console.log('🌐 globals.js loaded');

/**
 * DOM content loaded event to initialize global styles, animations, and navigation.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌍 Initializing global styles, animations, and navigation');
    ensureGlobalStyleInjected();
    console.log('🎨 Global styles injected');
    initFloatingParticles();
    console.log('✨ Floating particles animation initialized');
    setupNavigation();
    console.log('🧭 Navigation setup complete');
    setupSectionCardAnimations();
    console.log('📂 Section card animations setup complete');

    // Expertise tabs
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
