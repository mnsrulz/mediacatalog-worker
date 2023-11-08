import 'dotenv/config'
const Pusher = require('pusher-js');
import PS from 'pusher-js/index.js';
import config from './config.js';
import { handleNewMediaSourceAttached, handleRefreshSingleLink, handlePlexItemAdded } from './handlers/handleRefreshSingleLink.js';
const { pusherChannelName, pusherAppKey, pusherAppCluster } = config;

const singleLinkRefreshEventName = 'LINKS_REFRESH';
const MEDIA_SOURCE_ATTACHEDEventName = 'MEDIA_SOURCE_ATTACHED';
const PLEX_MEDIA_ADDED_EventName = 'PLEX_PLAYLIST';

const subscription: PS.default = new Pusher(pusherAppKey, {
    cluster: pusherAppCluster
});


const channel = subscription.subscribe(pusherChannelName);
channel.bind(singleLinkRefreshEventName, handleRefreshSingleLink);
channel.bind(MEDIA_SOURCE_ATTACHEDEventName, handleNewMediaSourceAttached);
channel.bind(PLEX_MEDIA_ADDED_EventName, handlePlexItemAdded);

await new Promise(resolve => { process.on('SIGTERM', resolve); });