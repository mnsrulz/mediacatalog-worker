import 'dotenv/config'
const Pusher = require('pusher-js');
import PS from 'pusher-js/index.js';
import c from './config.js';
import {log} from './logger.js';
import { handleNewMediaSourceAttached, handleRefreshSingleLink } from './handlers/handleRefreshSingleLink.js';
const { pusherChannelName, pusherAppKey, pusherAppCluster } = c;

const singleLinkRefreshEventName = 'LINKS_REFRESH';
const MEDIA_SOURCE_ATTACHEDEventName = 'MEDIA_SOURCE_ATTACHED';

const subscription: PS.default = new Pusher(pusherAppKey, {
    cluster: pusherAppCluster
});


const channel = subscription.subscribe(pusherChannelName);
channel.bind(singleLinkRefreshEventName, handleRefreshSingleLink);
channel.bind(MEDIA_SOURCE_ATTACHEDEventName, handleNewMediaSourceAttached);

while (true) {
    await new Promise(resolve => setTimeout(resolve, 60000));
    log.trace(`waiting for anotherloop`)
}