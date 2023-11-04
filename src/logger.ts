import * as Pino from 'pino';
import 'pino-pretty'
const logger = Pino.pino({
    transport: {
        target: 'pino-pretty'
    }
})

export const log = logger;
//const logger = require('pino')()
// const lg = logger({

// })
// export default logger.default;