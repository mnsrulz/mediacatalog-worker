import got from 'got';
import config from './config.js';
import { ResolvedMediaItem } from 'nurlresolver';
import { log } from './logger.js';
import { HttpReader, ZipReader } from '@zip.js/zip.js';
import { parse } from 'pathe';

log.info(`Initializing zip service with streamer URL: ${config.streamerApiUrl}`);
const instance = got.extend({ prefixUrl: config.streamerApiUrl });

export const fetchZipEntriesFromStreamer = async (imdbId: string, size: number) => {
    const docId = `z${size.toString(32)}`;
    const u = `${config.streamerApiUrl}/stream/${imdbId}/${docId}`;

    log.info(`Processing streamer url: ${u}`);
    
    const reader = new ZipReader(new HttpReader(u, {
        forceRangeRequests: true,
        useRangeHeader: true
    }));

    const entries = await reader.getEntries();

    //await is needed here since we are fetching the content offset for last entry manually
    const em = await Promise.all(entries.map(async ({ filename, compressedSize, uncompressedSize, compressionMethod, offset, directory, rawFilename, rawExtraField, crc32 }, ix, m) => {
        let contentOffset = 0;
        if (ix === m.length - 1) {
            // for last file let's calculate with inspecting the headers
            contentOffset = await fetchContentOffset(u, offset);
        } else {
            const { offset } = m.at(ix + 1)!;
            contentOffset = offset - compressedSize;
        }

        return {
            name: parse(filename).base,
            compressedSize, 
            uncompressedSize, 
            method: compressionMethod,
            rawFileNameLength: rawFilename.byteLength,
            rawExtraFieldLength: rawExtraField.byteLength,
            rawExtraFieldByteOffset: rawExtraField.byteOffset,
            directory,
            offset,
            start: contentOffset,
            end: contentOffset + compressedSize - 1,
            crc: crc32 || 0
        }
    }));

    return em.filter(k => !k.directory);
}

async function fetchContentOffset(u: string, offset: number) {
    const lfhResponse = await fetch(u, {
        headers: { 'Range': `bytes=${offset}-${offset + 29}` }
    });
    const lfhBuffer = await lfhResponse.arrayBuffer();
    const lfhView = new DataView(lfhBuffer);

    // Verify signature (0x04034b50)
    if (lfhView.getUint32(0, true) !== 0x04034b50) {
        throw new Error("Invalid Local File Header signature.");
    }

    // Extract the LFH specific lengths
    const lfhFilenameLength = lfhView.getUint16(26, true);
    const lfhExtraFieldLength = lfhView.getUint16(28, true);

    /**
     * STEP 2: Programmatically compute the true payload boundaries
     */
    return offset + 30 + lfhFilenameLength + lfhExtraFieldLength;
}

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