import resetCss from './reset.css';
import globalsCss from './globals.css';
import animationsCss from './animations.css';
import typographyCss from './typography.css';
import navbarCss from './navigation.css';

// -----------------------
// Combine CSS for constructible sheets or <style> fallback
// -----------------------
export const GLOBAL_STYLES = [resetCss, globalsCss, animationsCss, typographyCss, navbarCss]
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