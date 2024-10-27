import nurlresolver from "nurlresolver"
import config from "../config.js";
import { GdStreamsCustomResolver, GoogleDriveCustomResolver } from './GoogleDriveCustomResolver.js';
export const resolve = async (u: string) => {
    const result = await nurlresolver.resolveRecursive(u,{
        extractMetaInformation: true,
        timeout: config.urlResolverTimeout,
        customResolvers: [GoogleDriveCustomResolver, GdStreamsCustomResolver],
        ignoreResolvers: [/gDriveV2Resolver/, /GDriveResolver/]
    });
    return result;
}