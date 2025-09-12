import { ReactiveValue } from '../utils/reactive.js';

/**
 * BaseComponent
 * -------------
 * Minimal reusable base for all CV components.
 * Features:
 *  - Shadow DOM + template
 *  - CSS via adoptedStyleSheets
 *  - Reactive data binding
 *  - Event triggers
 *  - Resource cleanup
 */
export default class BaseComponent extends HTMLElement {
    constructor(template = '', css = '', dataAttr = null) {
        super();

        // Shadow DOM
        this.shadow = this.attachShadow({ mode: 'open' });

        // Inject template
        if (template) this.shadow.innerHTML = template;

        // Apply CSS via adoptedStyleSheets
        // inside BaseComponent constructor
        if (css) {
            if (typeof css === 'string') {
                const style = document.createElement('style');
                style.textContent = css;
                this.shadow.appendChild(style);
            } else {
                // For cases where css is already a CSSStyleSheet
                this.shadow.adoptedStyleSheets = [css];
            }
        }

        // Optional reactive data attribute
        this.dataAttr = dataAttr;

        // Reactive state
        this.data = new ReactiveValue([]);
        this.events = new ReactiveValue({});

        // Track disposables for cleanup
        this._disposables = new Set();
    }

    static get observedAttributes() {
        return ['data-certs']; // default reactive attribute, can override
    }

    connectedCallback() {
        // Subscribe to data changes for automatic render
        const dataSub = this.data.subscribe(value => this.renderData(value));
        this._disposables.add(dataSub);

        // Subscribe to events
        const eventSub = this.events.subscribe(events => {
            for (const key in events) {
                if (typeof this[key] === 'function') this[key](events[key]);
            }
        });
        this._disposables.add(eventSub);

        // Load initial data from attribute
        if (this.dataAttr) this.loadData();

        if (typeof this.onConnect === 'function') this.onConnect();
    }

    disconnectedCallback() {
        // Dispose of all tracked resources
        this._disposables.forEach(unsub => {
            if (typeof unsub === 'function') unsub();
        });
        this._disposables.clear();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === this.dataAttr && oldValue !== newValue) this.loadData();
    }

    /**
     * Load data from attribute (JSON string or URL)
     */
    loadData() {
        const attrValue = this.getAttribute(this.dataAttr);
        if (!attrValue) return;

        if (attrValue.startsWith('http')) {
            fetch(attrValue)
                .then(res => res.json())
                .then(data => this.data.set(data))
                .catch(console.error);
        } else {
            try {
                const parsed = JSON.parse(attrValue);
                this.data.set(parsed);
            } catch (err) {
                console.error('Invalid JSON', err);
            }
        }
    }

    /**
     * Bind data to template.
     * Override in derived component for custom behavior.
     */
    renderData(items) {
        const container = this.shadow.querySelector('[data-container]');
        const templateEl = this.shadow.querySelector('template');
        if (!container || !templateEl) return;

        container.innerHTML = '';

        items.forEach(item => {
            const clone = templateEl.content.cloneNode(true);

            clone.querySelectorAll('[data-field]').forEach(el => {
                const value = item[el.dataset.field];
                if (value) el.textContent = value;
                else el.remove();

                if (el.dataset.field === 'status' && value)
                    el.classList.add(value.toLowerCase());
            });

            container.appendChild(clone);
        });
    }

    /**
     * Trigger an event (e.g., toast, highlight, animation)
     */
    trigger(key, payload) {
        const events = { ...this.events.get() };
        events[key] = payload;
        this.events.set(events);
    }

    /**
     * Track disposables (timers, subscriptions)
     */
    track(disposable) {
        this._disposables.add(disposable);
    }
}
