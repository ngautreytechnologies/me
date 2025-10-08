import { DIContainer } from './container';

describe('DIContainer', () => {
    let container;
    beforeEach(() => {
        container = new DIContainer();
    });

    test('resolves a registered value', () => {
        container.registerValue('Config', { env: 'test' });
        expect(container.resolve('Config')).toEqual({ env: 'test' });
    });

    test('creates a singleton from a class by default', () => {
        class Service { }
        container.registerClass('Service', Service);
        const a = container.resolve('Service');
        const b = container.resolve('Service');
        expect(a).toBeInstanceOf(Service);
        expect(a).toBe(b);
    });

    test('creates new instances when transient', () => {
        class Thing { }
        container.registerClass('Thing', Thing, 'transient');
        const a = container.resolve('Thing');
        const b = container.resolve('Thing');
        expect(a).not.toBe(b);
    });

    test('factory registration returns instance', () => {
        container.registerFactory('Foo', () => ({ ok: true }));
        expect(container.resolve('Foo')).toEqual({ ok: true });
    });

    test('throws on unknown registration', () => {
        expect(() => container.resolve('Missing')).toThrow(/No registration found/);
    });

    test('scoped container inherits registrations', () => {
        class Scoped { }
        container.registerClass('Scoped', Scoped, 'scoped');
        const scoped1 = container.createScope();
        const scoped2 = container.createScope();
        expect(scoped1.resolve('Scoped')).not.toBe(scoped2.resolve('Scoped'));
    });
});
