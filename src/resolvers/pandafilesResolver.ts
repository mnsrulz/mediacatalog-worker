import { BaseUrlResolver, ResolvedMediaItem } from 'nurlresolver';
const captchaServiceUrl = 'http://localhost:3020/captcha';
export class pandafilesResolver extends BaseUrlResolver {
    constructor() {
        super({
            domains: [/https?:\/\/pandafiles/],
            useCookies: true,
            speedRank: 90
        });
    }

    async resolveInner(_urlToResolve: string): Promise<ResolvedMediaItem | ResolvedMediaItem[]> {
        const result = [];
        let retryCounter = 0;
        while (retryCounter++ < 5) {    //let's have a counter as sometimes the captch doesn't resolves
            const response = await this.gotInstance(_urlToResolve);
            const form = this.getHiddenForm(response.body);
            if (!form) return [];
            form['method_free'] = 'Free Download';
            delete form['method_premium'];
            const resp = await this.gotInstance.post(response.url, { form: form, throwHttpErrors: false });
            const captchaImageSrc = this.parseElementAttributes(resp.body, '.captcha img', 'src')[0];
            if (captchaImageSrc) {
                const f2 = this.getHiddenForm(resp.body);
                if (!f2) throw new Error('error!');
                const { text } = await this.gotInstance(captchaServiceUrl, {
                    searchParams: new URLSearchParams([['q', captchaImageSrc]])
                }).json<{ text: string; }>();
                if (!text) throw new Error('no code found');
                f2['code'] = text.trim();
                f2['adblock_detected'] = '0';
                const resp2 = await this.gotInstance.post(response.url, { form: f2 });
                const link = this.scrapeLinkHref(resp2.body, '#direct_link a');
                const title = form['fname']; //this.extractFileNameFromUrl(link);
                result.push({
                    link,
                    title,
                    isPlayable: true
                } as ResolvedMediaItem);
            }
        }
        return result;
    }
}
