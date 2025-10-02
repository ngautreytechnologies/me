/**
 * globals
 * 
 * This file sets up global styles, animations, and navigation behavior for the portfolio website.
 */

import { Config } from './config';
import { initFloatingParticles, setupSectionCardAnimations } from './modules/animation/animation';
import { setupNavigation } from './modules/dom/navigation';
import { Logger } from './modules/logging/logger';
import { ensureGlobalStyleInjected } from './styles/styles';

const logger = new Logger(Config.LOG_LEVEL || 'debug', console);

/**
 * DOM content loaded event to initialize global styles, animations, and navigation.
 */
document.addEventListener('DOMContentLoaded', () => {
    ensureGlobalStyleInjected();
    initFloatingParticles();
    setupNavigation();
    setupSectionCardAnimations();

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
