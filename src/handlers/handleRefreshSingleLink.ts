import PQueue from "p-queue";
import { addLink, expireLink, getLinkInfo, refreshLink } from "../apiClient.js";
import { log } from "../logger.js";
import { resolve } from "../resolvers/instance.js";

export const handleRefreshSingleLink = async (message: { id: string }) => {
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

const eventHandlerQueue = new PQueue({ concurrency: 1 });
export const handleNewMediaSourceAttached = async (message: { imdbId: string, webViewLink: string }) => {
    eventHandlerQueue.add(async () => {
        log.info(`message received with content: '${JSON.stringify(message)}' of type new media source attached`);
        if (message.imdbId && message.webViewLink) {
            const result = await resolve(message.webViewLink);
            log.info(`resolved ${result.length} items for given imdbId: ${message.imdbId}`);
            if(result.length === 0) return;
            let successCount = 0;
            for (const iterator of result) {
                try {
                    await addLink({
                        contentType: iterator.contentType,
                        headers: iterator.headers,
                        imdbId: message.imdbId,
                        parentLink: iterator.parent,
                        playableLink: iterator.link,
                        size: parseInt(iterator.size || '0'),
                        title: iterator.title
                    })
                } catch (error) {
                    log.error(`error occurred while adding the link for imdbId: ${message.imdbId}. JSON: ${JSON.stringify(iterator, null, 4)}`);
                }
            }
            log.info(`added ${successCount}/${result.length} items for given imdbId: ${message.imdbId}`);
        } else {
            log.warn(`either the imdbId or the webview link is null for this message so we cannot handle it!`);
        }
    })
}
