import * as Pino from 'pino';
import 'pino-pretty'
import '@logtail/pino'

const { pino } = Pino;
const token = process.env.LOGTAIL_TOKEN;
const ts = [{
    target: 'pino-pretty',
    options: {}
}];
if(token) {
    ts.push({
        target: "@logtail/pino",
        options: { sourceToken: token }
    })
}

const logger = pino({
    transport: {
        targets: ts
    }
});

export const log = logger;