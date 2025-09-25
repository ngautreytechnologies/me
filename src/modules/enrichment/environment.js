import { Config } from '../../config'
import { Logger } from '../logging/logger'

export function environmentEnricher(meta, ctx) {
    const log = new Logger({ level: Config.LOG_LEVEL, output: console })
    log.debug('Enriching with timestamp...', [meta, ctx])

    // Detect environment
    let env = 'browser' // default
    if (typeof window !== 'undefined') {
        env = 'browser'
    } else if (typeof self !== 'undefined') {
        env = 'web-worker'
    }

    return { ...meta, env }
}
