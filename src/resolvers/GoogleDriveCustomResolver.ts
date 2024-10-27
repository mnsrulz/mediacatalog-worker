import { BaseUrlResolver, ResolvedMediaItem, utils } from 'nurlresolver';
import { JWT } from 'google-auth-library';
import got from 'got';
import config from '../config.js';
import { log } from '../logger.js';
const parseFileId = (_urlToResolve: string) => {
    if (_urlToResolve.indexOf('authenticatedgoogleclient') > 0) {
        return _urlToResolve.split('/').pop();
    } else {
        return utils.parseGoogleFileId(_urlToResolve);
    }
}
const client = new JWT({
    email: config.googleDriveServiceAccountEmail,
    key: config.googleDriveJwtKey,
    scopes: ['https://www.googleapis.com/auth/drive']
});

export class GoogleDriveCustomResolver extends BaseUrlResolver {
    constructor() {
        super({
            domains: [/https?:\/\/((drive|docs)\.google)\.com/],
            speedRank: 100
        });
    }
    async resolveInner(_urlToResolve: string): Promise<ResolvedMediaItem | ResolvedMediaItem[]> {
        //if (!client.key || !client.email) return [];   //early exit
        //Logger.info('Inside custom google resolver');
        const links = [];
        const googleDriveId = parseFileId(_urlToResolve);
        if (googleDriveId) {
            // log.info(`trying to get google access token!`);
            await tryAddToMyCollection(googleDriveId);
            const accessToken = await client.getAccessToken();
            // log.info(`google custom resolver token call succeded!`);
            const headers = {
                Authorization: `Bearer ${accessToken.token}`
            }
            //Logger.log('acquired access token...');
            const response = await got(`https://www.googleapis.com/drive/v3/files/${googleDriveId}?supportsAllDrives=true&fields=*`, {
                headers
            }).json<{ name: string, size: string, modifiedTime: Date, mimeType: string }>();
            //Logger.log('got successfull response for file info endpoint...');
            const result = {
                link: `https://gdstreams.netlify.app/api/files/${googleDriveId}/streams`,
                isPlayable: true,
                parent: `http://authenticatedgoogleclient.com/${googleDriveId}`,
                title: response.name,
                size: response.size,
                lastModified: response.modifiedTime.toString(),
                contentType: response.mimeType
            } as ResolvedMediaItem;
            result.headers = headers;
            links.push(result);            
        }
        return links;
    }

    async fillMetaInfo(resolveMediaItem: ResolvedMediaItem): Promise<void> {
        //do nothing...
    }
}

export class GdStreamsCustomResolver extends BaseUrlResolver {
    constructor() {
        super({
            domains: [/http:\/\/authenticatedgoogleclient/],
            speedRank: 100
        });
    }
    async resolveInner(_urlToResolve: string): Promise<ResolvedMediaItem | ResolvedMediaItem[]> {
        const googleDriveId = new URL(_urlToResolve).pathname.split('/').pop();
        const links = [];
        if (googleDriveId) {
            const { fileSize, title, mimeType } = await this.gotInstance(`https://gdstreams.netlify.app/api/files/${googleDriveId}`).json<{ title: string, fileSize: number, mimeType: string }>();
            await this.gotInstance.head(`https://gdstreams.netlify.app/api/files/${googleDriveId}/streams`);
            const result = {
                link: `https://gdstreams.netlify.app/api/files/${googleDriveId}/streams`,
                isPlayable: true,
                parent: _urlToResolve,
                title: title,
                size: `${fileSize}`,
                lastModified: undefined,
                contentType: mimeType
            } as ResolvedMediaItem;            
            links.push(result);
        }
        return links;
    }

    async fillMetaInfo(resolveMediaItem: ResolvedMediaItem): Promise<void> {
        //do nothing...
    }
}

const inmemmap = new Set<string>();
async function tryAddToMyCollection(googleDriveId: string) {
    if (inmemmap.has(googleDriveId)) return; //already in collection

    try {
        inmemmap.add(googleDriveId)
        await got.post(`https://gdstreams.netlify.app/api/files/${googleDriveId}`);
    } catch (error) {
        log.error(`error occurred while adding file: '${googleDriveId}' to my collection`);
    }
}