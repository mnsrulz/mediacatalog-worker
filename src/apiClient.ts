import got from 'got';
import config from './config.js';
const instance = got.extend({ prefixUrl: config.linksApiUrl });
interface linkResponse {
    id: string,
    contentType: string,
    lastModified: string,
    status: string,
    title: string,
    playableLink: string,
    speedRank: number,
    parentLink: string,
    headers: Record<string, string>
}
export const getLinkInfo = async (linkId: string) => {
    console.log(`requesting link info for linkId:${linkId}`);
    const u = await instance(`api/links/${linkId}`)
        .json<linkResponse>();
    return u ;
}

export const expireLink = async (linkId: string)=>{
    console.log(`requesting link info for linkId:${linkId}`);
    await instance.post(`api/links/${linkId}/expire`);
}

export const refreshLink = async (linkId: string, playableLink:string, headers: Record<string,string>)=>{
    console.log(`requesting link info for linkId:${linkId}`);
    await instance.put(`api/links/${linkId}/refresh`, {
        json: {
            playableLink,
            headers
        }
    });
}

// export const requestRefresh = async (docId: string) => {
//     const urlPath = `api/links/${docId}/refresh`;
//     try {
//         log.info(`requesting refresh for docId: ${docId}`);
//         await instance.post(urlPath);
//     } catch (error) {
//         log.error(`Error occurred while calling the refresh api ${urlPath}. Possibly the api is down.`);
//     }
// }