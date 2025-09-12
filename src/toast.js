import BaseComponent from './base-component.js';
import { subscribeToast } from '../utils/signal-store.js';

class Toast extends BaseComponent {
    constructor() {
        super();
    }

    onConnect() {
        const unsubscribe = subscribeToast(msg => {
            if (!msg) return;
            const el = document.createElement('div');
            el.textContent = msg;
            el.style.cssText = `
                position: fixed; bottom: 20px; right: 20px;
                background: #333; color: #fff; padding: 10px; border-radius: 5px;
            `;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 3000);
        });

        this.track(unsubscribe);
    }
}

customElements.define('toast-container', Toast);
