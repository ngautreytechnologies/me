/* 
A simple reactive value implementation in JavaScript. 
Allows subscribing to changes and notifying subscribers 
when the value changes. 
*/
export class ReactiveValue {
    constructor(initial) {
        this._value = initial;
        this.subscribers = new Set();
    }

    get() {
        // Get current value
        return this._value;
    }

    set(newValue) {
        if (newValue !== this._value) {
            // Only update if value changed
            this._value = newValue;
            // Notify all subscribers
            this.subscribers.forEach(cb => cb(newValue));
        }
    }

    subscribe(cb) {
        // Add subscriber and return unsubscribe function
        this.subscribers.add(cb);
        // Immediately call with current value
        cb(this._value);
        // Return unsubscribe function
        return () => this.subscribers.delete(cb);
    }
}
