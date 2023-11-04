import { BaseUrlResolver, ResolvedMediaItem } from 'nurlresolver';

//for testing only.. not in use
export class gdtotResolverV2 extends BaseUrlResolver {
    constructor() {
        super({
            domains: [/https?:\/\/\w+\.gdtot/],
            speedRank: 95,
            useCookies: true
        });
    }

    async resolveInner(_urlToResolve: string) {
        const u = new URL(_urlToResolve);
        const fileId = u.pathname.split('/').pop();
        u.pathname = `/ddl/${fileId}`;
        const response = await this.gotInstance(u.href, {
            throwHttpErrors: false
        });
        
        const btnAttribute = this.parseElementAttributes(response.body, '#dirdown', 'onclick')[0];
        const rx = /'([^']*)'/;
        const rxresult = rx.exec(btnAttribute);
        const gdurl = rxresult![1];
        const result = await this._context?.resolveRecursive(gdurl, this._resolverOptions);
        //alright so here we construct two result one for filepress and one for google drive
        if (result && result.length > 0) {
            const clonedResult = Object.assign({}, result[0]);
            clonedResult.parent = _urlToResolve;
            return [clonedResult, ...result];
        }
        return [];
    }
    async fillMetaInfo(resolveMediaItem: ResolvedMediaItem) {
        //do nothing...
    }
}

export class gdtotV2 extends BaseUrlResolver {
    constructor() {
        super({
            domains: [/https?:\/\/\w+\.gdtot/],
            speedRank: 95,
            useCookies: true
        });
    }

    async resolveInner(_urlToResolve: string) {
        
        const u = new URL(_urlToResolve);
        const fileId = u.pathname.split('/').pop();
        u.pathname = `/ddl/${fileId}`;
        const response = await this.gotInstance(u.href, {
            throwHttpErrors: false
        });
        
        const btnAttribute = this.parseElementAttributes(response.body, '#dirdown', 'onclick')[0];
        const rx = /'([^']*)'/;
        const rxresult = rx.exec(btnAttribute);
        const gdurl = rxresult![1];

        const result = await this._context?.resolveRecursive(gdurl, this._resolverOptions);
        //alright so here we construct two result one for filepress and one for google drive
        if (result && result.length > 0) {
            const clonedResult = Object.assign({}, result[0]);
            clonedResult.parent = _urlToResolve;
            return [clonedResult, ...result];
        }
        return [];
    }
    async fillMetaInfo(resolveMediaItem: ResolvedMediaItem) {
        //do nothing...
    }
}


