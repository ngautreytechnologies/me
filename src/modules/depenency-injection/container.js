/**
 * A lightweight framework agnostic dependency injection container supporting:
 *  - Singleton, Transient, and Scoped lifetimes
 *  - Class, Factory, and Value registration
 */

export class DIContainer {
    constructor(parent = null) {
        this._registrations = new Map();
        this._instances = new Map();
        this._parent = parent; // used for scoped containers
    }

    /**
     * Register a class that will be constructed automatically.
     * @param {string} key
     * @param {Function} Class
     * @param {'singleton'|'transient'|'scoped'} [lifetime='singleton']
     */
    registerClass(key, Class, lifetime = 'singleton') {
        this._registrations.set(key, { type: 'class', Class, lifetime });
    }

    /**
     * Register a factory function that returns an instance.
     * @param {string} key
     * @param {Function} factory
     * @param {'singleton'|'transient'|'scoped'} [lifetime='singleton']
     */
    registerFactory(key, factory, lifetime = 'singleton') {
        this._registrations.set(key, { type: 'factory', factory, lifetime });
    }

    /**
     * Register a static value or object.
     * @param {string} key
     * @param {any} value
     */
    registerValue(key, value) {
        this._registrations.set(key, { type: 'value', value, lifetime: 'singleton' });
        this._instances.set(key, value);
    }

    /**
     * Resolve a dependency.
     * @param {string} key
     */
    resolve(key) {
        // If already instantiated singleton, return it
        if (this._instances.has(key)) {
            return this._instances.get(key);
        }

        const registration = this._registrations.get(key) || this._parent?._registrations.get(key);
        if (!registration) {
            throw new Error(`[DI] No registration found for key: ${key}`);
        }

        let instance;

        switch (registration.type) {
            case 'class':
                instance = new registration.Class(this);
                break;
            case 'factory':
                instance = registration.factory(this);
                break;
            case 'value':
                instance = registration.value;
                break;
            default:
                throw new Error(`[DI] Unknown registration type for ${key}`);
        }

        if (registration.lifetime === 'singleton') {
            this._instances.set(key, instance);
        }

        return instance;
    }

    /**
     * Create a scoped container that inherits registrations but not instances.
     * Useful for per-request or per-stage lifetimes.
     */
    createScope() {
        return new DIContainer(this);
    }
}

export const container = new DIContainer();
