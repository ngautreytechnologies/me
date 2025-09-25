import EventEmitter from 'events';

export function eventStep(eventEmitter = new EventEmitter()) {
    return async (ctx, next) => {
        eventEmitter.emit('request:start', ctx);
        const result = await next();
        eventEmitter.emit('request:end', ctx, result);
        return result;
    };
}