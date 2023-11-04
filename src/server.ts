import 'dotenv/config'
const Pusher = require('pusher-js');
import PS from 'pusher-js/index.js';
import { resolve } from './resolvers/instance.js'
import { expireLink, getLinkInfo, refreshLink } from './apiClient.js'
import c from './config.js';
import {log} from './logger.js';
const { pusherChannelName, pusherAppKey, pusherAppCluster } = c;

const singleLinkRefreshEventName = 'LINKS_REFRESH';

const subscription: PS.default = new Pusher(pusherAppKey, {
    cluster: pusherAppCluster
});

const handleRefreshSingleLink = async (message: { id: string }) => {
    log.info(`message received with content: ${JSON.stringify(message)}`);
    const { parentLink } = await getLinkInfo(message.id);
    const result = await resolve(parentLink);

    //todo: should we validate the content length of the existing link with new link???
    if (result.length === 0) {
        log.warn(`no result found for this playble link: ${parentLink}`);
        await expireLink(message.id);
    } else if (result.length === 1) {
        log.info(`found a good link for this playable link: ${parentLink}`);
        await refreshLink(message.id, result[0].link, result[0].headers);
    } else {
        log.info(`found multiple good links '${result.length}' for this playable link: ${parentLink}`);
        await refreshLink(message.id, result[0].link, result[0].headers);
    }
}

const channel = subscription.subscribe(pusherChannelName);
channel.bind(singleLinkRefreshEventName, handleRefreshSingleLink);

while (true) {
    log.info(`waiting for anotherloop`)
    await new Promise(resolve => setTimeout(resolve, 30000));
}