import { Logger } from '../logging/logger'
import { Config } from '../../config'

export function timestampEnricher(meta, ctx) {
    const log = new Logger({ level: Config.LOG_LEVEL, console: console })
    log.debug('Enriching with timestamp...', [meta, ctx])
    return { ...meta, timestamp: new Date().toISOString() };
}
