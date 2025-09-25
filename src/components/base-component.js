import { } from '../styles/styles'
import { GLOBAL_SHEETS, ensureGlobalStyleInjected } from '../styles/styles';
import { ReactiveValue } from '../modules/reactivity/reactive';
import { removeElements } from '../modules/dom/dom';

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

        this.templateHtml = template;
        this.data = new ReactiveValue([]);
        this.supplementaryData = new ReactiveValue([]);
        this.events = new ReactiveValue({});
        this._disposables = new Set();

        this._applyStyles(componentCss);
        this._applyFonts();
        this._injectTemplate(template);

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
        this._log('Setting up reactive subscriptions');

        this._trackDisposable(this.data.subscribe(val => {
            this._log('Reactive data updated', val);
        }));
        this._trackDisposable(this.supplementaryData.subscribe(val => {
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
            this._log('Injecting initial template on connectedCallback');
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
    triggerTemplateRender(itemsOrLoader = null) {
        this._log('triggerTemplateRender start', itemsOrLoader);

        if (typeof itemsOrLoader === 'function') {
            const result = itemsOrLoader();
            this._log('Loader function called', result);

            if (result instanceof Promise) {
                result
                    .then(data => {
                        this._log('Loader Promise resolved', data);
                        this.data.set(data);
                        this._triggerInternalRender();
                    })
                    .catch(err => {
                        console.error('Loader function failed', err);
                    });
            } else {
                this._log('Loader function returned data synchronously', result);
                this.data.set(result);
                this._triggerInternalRender();
            }

            return;
        }

        if (itemsOrLoader !== null) {
            this._log('Setting data from triggerTemplateRender param', itemsOrLoader);
            this.data.set(itemsOrLoader);
        }

        this._triggerInternalRender();
    }

    _triggerInternalRender() {
        Promise.resolve().then(() => {
            const items = this.data.get();
            this._log('Internal render triggered', items);

            if (typeof this.renderTemplateData === 'function') {
                this.renderTemplateData(items);
            } else {
                console.warn(`[${this.constructor.name}] renderTemplateData not implemented`, items);
            }
        });
    }

    // -----------------------
    // Data + Rendering
    // -----------------------
    triggerSupplementaryDataRender(itemsOrLoader = null) {
        this._log('triggerSupplementaryDataRender start', itemsOrLoader);

        if (typeof itemsOrLoader === 'function') {
            const result = itemsOrLoader();
            this._log('Loader function called', result);

            if (result instanceof Promise) {
                result
                    .then(data => {
                        this._log('Loader Promise resolved', data);
                        this.supplementaryData.set(data);
                        this._triggerSupplementaryDataRender();
                    })
                    .catch(err => {
                        console.error('Loader function failed', err);
                    });
            } else {
                this._log('Loader function returned data synchronously', result);
                this.supplementaryData.set(result);
                this._triggerSupplementaryDataRender();
            }

            return;
        }

        if (itemsOrLoader !== null) {
            this._log('Setting data from triggerTemplateRender param', itemsOrLoader);
            this.supplementaryData.set(itemsOrLoader);
        }

        this._triggerSupplementaryDataRender();
    }

    _triggerSupplementaryDataRender() {
        Promise.resolve().then(() => {
            const items = this.supplementaryData.get();
            this._log('Internal supplementary render triggered', items);

            if (typeof this.renderSupplementaryData === 'function') {
                this.renderSupplementaryData(items);
            } else {
                console.warn(`[${this.constructor.name}] renderSupplementaryData not implemented`, items);
            }
        });
    }

    renderTemplateData(items) {
        this._log(`[${this.constructor.name}] renderTemplateData placeholder`, items);
    }

    // TODO: Make more secure etc
    renderSupplementaryData(html) {
        this._log(`[${this.constructor.name}] renderSupplementaryData placeholder`, html);
    }

    // -----------------------
    // Helpers
    // -----------------------
    _log(...args) {
        if (this.constructor.debug) {
            console.groupCollapsed(`[${this.constructor.name}]`, ...args);
            console.groupEnd();
        }
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
                this._log('❌ Failed to create CSSStyleSheet', err);
            }
        }

        if (this.useShadow && 'adoptedStyleSheets' in this.root) {
            this.root.adoptedStyleSheets = sheets;
        } else if (componentCss) {
            const styleId = `component-style-${this.constructor.name}`;
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = componentCss;
                document.head.appendChild(style);
                this._log('Injected style element into <head>');
            }
            ensureGlobalStyleInjected();
        }

        this._log('_applyStyles complete');
    }

    _applyFonts() {
        this._log('_applyFonts start');
        if (!this.useShadow) {
            return;
        }

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
        if (!template) {
            return;
        }

        const temp = document.createElement('template');
        temp.innerHTML = template.trim();

        const target = containerSelector ? this.root.querySelector(containerSelector) : this.root;
        removeElements(target, 'template');

        const hasNestedTemplate = !!temp.content.querySelector('template');
        if (hasNestedTemplate) {
            Array.from(temp.content.childNodes).forEach(node => target.appendChild(node.cloneNode(true)));
        } else {
            target.appendChild(temp.content.cloneNode(true));
        }

        if (typeof this.onTemplateInjected === 'function') {
            this.onTemplateInjected(target);
        }

        this._log('_injectTemplate complete');
    }

    _disposeAll() {
        this._disposables.forEach(fn => {
            if (typeof fn === 'function') {
                fn();
            }
        });
        this._disposables.clear();
    }

    _trackDisposable(disposable) {
        if (disposable) {
            this._disposables.add(disposable);
        }
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

    static getComponentSheet(cssText) {
        if (!this._componentSheets.has(cssText)) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(cssText);
            this._componentSheets.set(cssText, sheet);
        }
        return this._componentSheets.get(cssText);
    }
}
