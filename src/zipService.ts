import got from 'got';
import config from './config.js';
import { ResolvedMediaItem } from 'nurlresolver';
import { log } from './logger.js';

log.info(`Initializing zip service with URL: ${config.zipServiceUrl}`);
const instance = got.extend({ prefixUrl: config.zipServiceUrl });

export const fetchZipEntries = async (result: ResolvedMediaItem[]) => {
    const sizeDictionary = new Map<string, ResolvedMediaItem[]>();
    const zipResult = new Map<string, ZipEntry[]>();
    for (const iterator of result) {
        if (!iterator.size) {
            log.warn(`size is null for this item: ${JSON.stringify(iterator, null, 4)}`);
            continue;
        }
        if (sizeDictionary.has(iterator.size)) {
            sizeDictionary.get(iterator.size)?.push(iterator);
        } else {
            sizeDictionary.set(iterator.size, [iterator]);
        }
    }

    for (const [zipSize, value] of sizeDictionary.entries()) {
        const entries = await tryFetchEntries(value);
        entries && entries.length > 0 && zipResult.set(zipSize, entries);
    }

    return zipResult;
}

async function tryFetchEntries(items: ResolvedMediaItem[]) {
    for (const v of items) {
        try {
            const searchParams = new URLSearchParams({ u: v.link });
            if (v.headers) {
                for (const [name, headerValue] of Object.entries(v.headers)) {
                    searchParams.append('h', `${name}:${headerValue}`);
                }
            }
            const entries = await instance.get('files', { searchParams }).json<ZipEntry[]>();
            return entries;
        } catch (error) {
            log.error(error, `Error occurred while fetching entries for item: ${JSON.stringify(v, null, 4)}`);
        }
    }
}

type ZipEntry = {
    fileName: string;
    compressedSize: number;
    uncompressedSize: number;
    compressionMethod: number;
    rawFileNameLength: number;
    rawExtraFieldLength: number;
    rawExtraFieldByteOffset: number;
    directory: boolean;
    offset: number;
    contentOffset: number;
};