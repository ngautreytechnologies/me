/**
 * globals
 * 
 * This file sets up global styles, animations, and navigation behavior for the portfolio website.
 */

import { initFloatingParticles, setupSectionCardAnimations } from './modules/animation/animation';
import { setupNavigation } from './modules/dom/navigation';
import { RequestPipeline } from './modules/pipeline/request-pipeline';
import { ensureGlobalStyleInjected } from './styles/styles';
import { Logger } from './modules/logging/logger';
import { Config } from './config';
import { anonymizationStep, piiRedactionStep, differentialPrivacyStep } from './modules/privacy/privacy';
import { enricherStep } from './modules/enrichment/enrichment';
import { timestampEnricher } from './modules/enrichment/timestamp';
import { environmentEnricher } from './modules/enrichment/environment';
import { ttlStep } from './modules/cache/cache';
import { retryStep } from './modules/resilience/resilience';
import attachGlobalHooks from './modules/hooks/global';

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

export const networkPipeline = new RequestPipeline()
    // No data being collected at all so don't need this step until 
    // analytics data is needed
    // .use(consentStep({ checkConsentFn: ctx => ctx.userConsent }))
    .use(piiRedactionStep())
    .use(anonymizationStep())
    .use(enricherStep(logger, [timestampEnricher, environmentEnricher]))
    .use(ttlStep({ storage: localStorage, keyFn: ctx => ctx.url, ttlMs: 5 * 60 * 1000 }))
    .use(retryStep({ retries: 3 }))

export const interactionPipeline = new RequestPipeline()
    // .use(consentStep({ checkConsentFn: ctx => ctx.userConsent }))
    .use(piiRedactionStep())
    .use(anonymizationStep())
    .use(enricherStep(logger, [timestampEnricher, environmentEnricher]))

export const storagePipeline = new RequestPipeline()
    // .use(consentStep({ checkConsentFn: ctx => ctx.userConsent }))
    .use(piiRedactionStep())
    .use(anonymizationStep())

export const analyticsPipeline = new RequestPipeline()
    // .use(consentStep({ checkConsentFn: ctx => ctx.userConsent }))
    .use(piiRedactionStep())
    .use(anonymizationStep())
    .use(differentialPrivacyStep({ numericKeys: ['count', 'duration'] }))
    .use(enricherStep(logger, [timestampEnricher]))

attachGlobalHooks({
    networkPipeline,
    interactionPipeline,
    storagePipeline,
    analyticsPipeline
});
