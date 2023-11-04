import { BaseUrlResolver, ResolvedMediaItem, utils } from 'nurlresolver';
import { JWT } from 'google-auth-library';
import got from 'got';
import config from '../config.js';
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
            domains: [/https?:\/\/authenticatedgoogleclient|((drive|docs)\.google)\.com/],
            speedRank: 100
        });
    }
    async resolveInner(_urlToResolve: string): Promise<ResolvedMediaItem | ResolvedMediaItem[]> {
        //if (!client.key || !client.email) return [];   //early exit
        //Logger.info('Inside custom google resolver');
        const links = [];
        const googleDriveId = parseFileId(_urlToResolve);
        if (googleDriveId) {
            const accessToken = await client.getAccessToken();
            const headers = {
                Authorization: `Bearer ${accessToken.token}`
            }
            //Logger.log('acquired access token...');
            const response = await got(`https://www.googleapis.com/drive/v3/files/${googleDriveId}?supportsAllDrives=true&fields=*`, {
                headers
            }).json<{ name: string, size: string, modifiedTime: Date, mimeType: string }>();
            //Logger.log('got successfull response for file info endpoint...');
            const result = {
                link: `https://www.googleapis.com/drive/v3/files/${googleDriveId}?alt=media`,
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

// export const getYoutubePlaylistItems = async (playlistId: string, pageToken: string) => {

//     const accessToken = await youtubeClient.getAccessToken();
//     const headers = {
//         Authorization: `Bearer ${accessToken.token}`
//     }
//     let u = `https://www.googleapis.com/youtube/v3/playlistItems?part=status&part=snippet%2CcontentDetails&maxResults=50&playlistId=${playlistId}`;
//     if (pageToken) u = `${u}&pageToken=${pageToken}`
//     const response = await got(u, {
//         headers
//     }).json<{
//         nextPageToken: string,
//         items: {
//             snippet: {
//                 title: string
//             },
//             contentDetails: {
//                 videoId: string
//             },
//             status: {
//                 privacyStatus: string
//             }
//         }[]
//     }>();

//     return {
//         nextPageToken: response.nextPageToken,
//         items: response.items
//             .filter(x => x.status.privacyStatus == 'public')    //to overcome deleted videos
//             .map(x => {
//                 return { videoId: x.contentDetails.videoId, title: x.snippet.title }
//             })
//     };
//     //Logger.log('got successfull response for file info endpoint...');
// }