import { GLOBAL_SHEETS, ensureGlobalStyleInjected } from '../utils/styles.js';
import { ReactiveValue } from '../utils/reactive.js';
import { removeElements } from '../utils/dom.js';

export default class BaseComponent extends HTMLElement {
    static debug = true;
    static _componentSheets = new Map();
    static _observedAttrs = [];

    constructor(template = '', componentCss = '', dataAttrs = null, useShadow = true) {
        super();

        this._log('Constructor start', { template, componentCss, dataAttrs, useShadow });

        this.useShadow = useShadow;
        this.root = this.useShadow ? this.attachShadow({ mode: 'open' }) : this;

        this.dataAttrs = Array.isArray(dataAttrs) ? dataAttrs : [dataAttrs].filter(Boolean);
        BaseComponent._observedAttrs = [...new Set([...BaseComponent._observedAttrs, ...this.dataAttrs])];

        this._applyStyles(componentCss);
        this._applyFonts();
        this._injectTemplate(template);

        this.data = new ReactiveValue([]);
        this.events = new ReactiveValue({});
        this._disposables = new Set();

        this.templateHtml = template;

        this._log('Constructor complete', { observedAttrs: BaseComponent._observedAttrs });
    }

    static get observedAttributes() { return this._observedAttrs; }

    connectedCallback() {
        this._log('connectedCallback start');

        if (this._initialized) {
            this._log('Already initialized, skipping connectedCallback');
            return;
        }
        this._initialized = true;

        this._log('Setting up subscriptions');
        this._trackDisposable(this.data.subscribe(val => {
            this._log('Reactive data updated', val);
        }));

        this._trackDisposable(this.events.subscribe(events => {
            this._log('Events updated', events);
            for (const key in events) {
                if (typeof this[key] === 'function') {
                    this._log(`Calling event handler ${key}`, events[key]);
                    this[key](events[key]);
                }
            }
        }));
        
        const container = this.root.querySelector('[data-container]');
        if (container && container.childNodes.length === 0 && this.templateHtml) {
            this._log('Injecting template on connectedCallback');
            this._injectTemplate(this.templateHtml);
        }

        if (typeof this.onConnect === 'function') {
            this._log('Calling onConnect hook');
            this.onConnect();
        }

        this._log('connectedCallback complete');
    }

    disconnectedCallback() {
        this._log('disconnectedCallback called, disposing all');
        this._disposeAll();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._log(`attributeChangedCallback: ${name}`, { oldValue, newValue });
        if (this.dataAttrs.includes(name) && oldValue !== newValue) {
            this._log(`Attribute ${name} changed, loading data`);
            this.loadData(name);
        }
    }

    // -----------------------
    // Data + Rendering
    // -----------------------
    triggerRender(itemsOrLoader = null) {
        this._log('triggerRender start', itemsOrLoader);

        if (typeof itemsOrLoader === 'function') {
            const loaderFn = itemsOrLoader;
            const result = loaderFn();
            this._log('Loader function called', result);

            if (result instanceof Promise) {
                result
                    .then(data => {
                        this._log('Loader Promise resolved', data);
                        this.data.set(data);
                        this._triggerInternalRender();
                    })
                    .catch(err => console.error('Loader function failed', err));
            } else {
                this._log('Loader function returned data synchronously', result);
                this.data.set(result);
                this._triggerInternalRender();
            }

            return;
        }

        if (itemsOrLoader !== null) {
            this._log('Setting data from triggerRender param', itemsOrLoader);
            this.data.set(itemsOrLoader);
        }

        this._triggerInternalRender();
    }

    _triggerInternalRender() {
        Promise.resolve().then(() => {
            const items = this.data.get();
            this._log('Internal render triggered', items);

            if (typeof this.renderData === 'function') {
                this.renderData(items);
            } else {
                console.warn(`[${this.constructor.name}] renderData not implemented`, items);
            }
        });
    }

    renderData(items) {
        console.warn(`[${this.constructor.name}] renderData not implemented`, items);
    }

    // -----------------------
    // Helpers
    // -----------------------
    _log(...args) {
        if (this.constructor.debug) console.log(`[${this.constructor.name}]`, ...args);
    }

    _applyStyles(componentCss) {
        this._log('_applyStyles start', componentCss);
        const sheets = [...GLOBAL_SHEETS];
        if (componentCss && typeof CSSStyleSheet !== 'undefined') {
            try {
                const sheet = this.constructor.getComponentSheet(componentCss);
                sheets.push(sheet);
                this._log('CSSStyleSheet created and added', sheet);
            } catch (err) {
                this._log('❌ Failed to create component CSSStyleSheet', err);
            }
        }

        if (this.useShadow && 'adoptedStyleSheets' in this.root) {
            this.root.adoptedStyleSheets = sheets;
            this._log('Applied styles to shadowRoot adoptedStyleSheets', sheets);
        } else if (componentCss) {
            this._log('⚠️ Injecting light DOM styles into <head>');
            const styleId = `component-style-${this.constructor.name}`;
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = componentCss;
                document.head.appendChild(style);
                this._log('Injected style element into <head>', style);
            }
            ensureGlobalStyleInjected();
        }

        this._log('_applyStyles complete');
    }

    _applyFonts() {
        this._log('_applyFonts start');
        if (!this.useShadow) return;

        const fonts = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ];

        fonts.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            this.root.appendChild(link);
            this._log('Font link appended', href);
        });

        this._log('_applyFonts complete');
    }

    _injectTemplate(template, containerSelector = null) {
        this._log('_injectTemplate start', containerSelector);
        if (!template) return;

        const temp = document.createElement('template');
        temp.innerHTML = template.trim();

        const target = containerSelector ? this.root.querySelector(containerSelector) : this.root;
        this._log('Target for template injection', target);

        removeElements(target, 'template');
        this._log('Previous templates removed from target');

        if (temp.content.querySelector('template')) {
            this._log('Preserving <template> element');
            Array.from(temp.content.childNodes).forEach(node => target.appendChild(node.cloneNode(true)));
        } else {
            this._log('Injecting raw HTML template');
            target.appendChild(temp.content.cloneNode(true));
        }

        if (typeof this.onTemplateInjected === 'function') {
            this._log('Calling onTemplateInjected hook');
            this.onTemplateInjected(target);
        }

        this._log('_injectTemplate complete');
    }

    _disposeAll() {
        this._log('_disposeAll start', this._disposables);
        for (const unsub of this._disposables) if (typeof unsub === 'function') unsub();
        this._disposables.clear();
        this._log('_disposeAll complete');
    }

    _trackDisposable(disposable) {
        if (disposable) {
            this._log('_trackDisposable', disposable);
            this._disposables.add(disposable);
        }
        return disposable;
    }

    trigger(key, payload) {
        const events = { ...this.events.get() };
        events[key] = payload;
        this._log('trigger event', key, payload);
        this.events.set(events);
    }

    track(disposable) {
        this._trackDisposable(disposable);
    }

    static getComponentSheet(cssText) {
        if (!this._componentSheets.has(cssText)) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(cssText);
            this._componentSheets.set(cssText, sheet);
            if (this.debug) console.log(`[${this.name}] CSSStyleSheet created for text`, cssText);
        }
        return this._componentSheets.get(cssText);
    }
}
