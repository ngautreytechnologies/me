import { GLOBAL_SHEETS, ensureGlobalStyleInjected } from '../utils/styles.js';
import { ReactiveValue } from '../utils/reactive.js';
import { removeElements } from '../utils/dom.js';

export default class BaseComponent extends HTMLElement {
    static debug = true;
    static _componentSheets = new Map();
    static _observedAttrs = [];

    constructor(template = '', componentCss = '', dataAttrs = null, useShadow = true) {
        super();

        // Shadow or Light DOM
        this.useShadow = useShadow;
        this.root = this.useShadow ? this.attachShadow({ mode: 'open' }) : this;

        // Observed attributes
        this.dataAttrs = Array.isArray(dataAttrs) ? dataAttrs : [dataAttrs].filter(Boolean);
        BaseComponent._observedAttrs = [...new Set([...BaseComponent._observedAttrs, ...this.dataAttrs])];

        // Logging
        this._log('Constructor start', { template, componentCss, dataAttrs, useShadow });

        // Apply styles, fonts, template
        this._applyStyles(componentCss);
        this._applyFonts();
        this._injectTemplate(template);

        // Reactive state
        this.data = new ReactiveValue([]);
        this.events = new ReactiveValue({});
        this._disposables = new Set();
    }

    // -----------------------
    // Lifecycle
    // -----------------------
    static get observedAttributes() { return this._observedAttrs; }

    connectedCallback() {
        // Prevent multiple initializations
        if (this._initialized) return;
        this._initialized = true;

        // Subscribe to reactive state
        this._trackDisposable(
            this.data.subscribe(value => this.renderData(value))
        );
        this._trackDisposable(
            this.events.subscribe(events => {
                for (const key in events) {
                    if (typeof this[key] === 'function') this[key](events[key]);
                }
            })
        );

        // Load initial data
        this.dataAttrs.forEach(attr => this.loadData(attr));

        // Inject template only if container exists and is empty
        const container = this.root.querySelector('[data-container]');
        if (container && container.childNodes.length === 0 && this.templateHtml) {
            this._injectTemplate(this.templateHtml);
        }

        // Call hook
        if (typeof this.onConnect === 'function') this.onConnect();
    }

    disconnectedCallback() {
        this._disposeAll();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.dataAttrs.includes(name) && oldValue !== newValue) this.loadData(name);
    }

    // -----------------------
    // Data + Rendering
    // -----------------------
    loadData(attr = this.dataAttrs[0]) {
        // Can be overridden in subclasses
        const attrValue = this.getAttribute(attr);
        if (!attrValue) return;

        if (attrValue.startsWith('http')) {
            fetch(attrValue)
                .then(res => res.json())
                .then(data => this.data.set(data))
                .catch(err => console.error(err));
        } else {
            try {
                const parsed = JSON.parse(attrValue);
                this.data.set(parsed);
            } catch (err) {
                console.error('Invalid JSON', err);
            }
        }
    }

    renderData(items) {
        console.warn(`[${this.constructor.name}] renderData not implemented`, items);
    }

    // -----------------------
    // Helpers
    // -----------------------
    _log(...args) { if (this.constructor.debug) console.log(`[${this.constructor.name}]`, ...args); }

    _applyStyles(componentCss) {
        const sheets = [...GLOBAL_SHEETS];

        if (componentCss && typeof CSSStyleSheet !== 'undefined') {
            try {
                const sheet = this.constructor.getComponentSheet(componentCss);
                sheets.push(sheet);
            } catch (err) {
                this._log('❌ Failed to create component CSSStyleSheet', err);
            }
        }

        if (this.useShadow && 'adoptedStyleSheets' in this.root) {
            // Shadow DOM: use adoptedStyleSheets
            this.root.adoptedStyleSheets = sheets;
        } else {
            // Light DOM: inject <style> into <head> for global effect
            if (componentCss) {
                this._log('⚠️ Injecting light DOM styles into <head>');
                const styleId = `component-style-${this.constructor.name}`;
                if (!document.getElementById(styleId)) {
                    const style = document.createElement('style');
                    style.id = styleId;
                    style.textContent = componentCss;
                    document.head.appendChild(style);
                }
            }
            ensureGlobalStyleInjected();
        }
    }

    _applyFonts() {
        const fonts = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ];

        if (!this.useShadow) return;

        fonts.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            this.root.appendChild(link);
        });
    }

    _injectTemplate(template, containerSelector = null) {
        if (!template) return;

        const temp = document.createElement('template');
        temp.innerHTML = template.trim();

        const target = containerSelector
            ? this.root.querySelector(containerSelector)
            : this.root;

        // Clear previous content
        this._log(`[${this.constructor.name}] Clearing target for template injection`, target);
        removeElements(target, 'template');

        // If the template string already has a <template> tag, preserve it
        if (temp.content.querySelector('template')) {
            this._log(`[${this.constructor.name}] Preserving <template> element`);
            Array.from(temp.content.childNodes).forEach(node => {
                target.appendChild(node.cloneNode(true));
            });
        } else {
            this._log(`[${this.constructor.name}] Injecting as raw HTML`);
            target.appendChild(temp.content.cloneNode(true));
        }

        // Hook for subclasses
        if (typeof this.onTemplateInjected === 'function') {
            this.onTemplateInjected(target);
        }
    }

    // -----------------------
    // Disposables / events
    // -----------------------
    _disposeAll() {
        for (const unsub of this._disposables) if (typeof unsub === 'function') unsub();
        this._disposables.clear();
    }

    _trackDisposable(disposable) {
        if (disposable) this._disposables.add(disposable);
        return disposable;
    }

    trigger(key, payload) {
        const events = { ...this.events.get() };
        events[key] = payload;
        this.events.set(events);
    }

    track(disposable) {
        this._trackDisposable(disposable);
    }

    // -----------------------
    // CSS helper
    // -----------------------
    static getComponentSheet(cssText) {
        if (!this._componentSheets.has(cssText)) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(cssText);
            this._componentSheets.set(cssText, sheet);
        }
        return this._componentSheets.get(cssText);
    }
}
