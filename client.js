import HttpProxyAgent from 'http-proxy-agent';
import fetch, { Headers, Request } from 'node-fetch';
import { Config } from './config.js'
import { SinglePage } from './single-page.js';

export class Client {
    /**@param {Config} config*/
    constructor(config) {
        this.cookies = config.cookies;
        this.ua = config.ua || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
        this.host = config.ex ? "exhentai.org" : "e-hentai.org";
        this.http_proxy = process.env.http_proxy;
        this.agent = undefined;
        if (this.http_proxy) {
            this.agent = new HttpProxyAgent(this.http_proxy);
        }
    }
    /**
     * @param {string | Request} url
     * @param {string} method
     */
    request(url, method, options=undefined) {
        let headers = new Headers();
        headers.set("User-Agent", this.ua);
        if (typeof url === "string") {
            let u = new URL(url);
            if (u.hostname == 'e-hentai.org' || u.hostname == 'exhentai.org') {
                headers.set("Cookie", this.cookies);
            }
        } else if (url instanceof Request) {
            let u = new URL(url.url);
            if (u.hostname == 'e-hentai.org' || u.hostname == 'exhentai.org') {
                headers.set("Cookie", this.cookies);
            }
        }
        return fetch(url, Object.assign({method, headers, agent: this.agent}, options))
    }
    /**
     * Fetch a single page (use HTML)
     * @param {number} gid Gallery ID
     * @param {string} page_token Page token
     * @param {number} index Page index
     * @returns 
     */
    async fetchSignlePage(gid, page_token, index) {
        let url = `https://${this.host}/s/${page_token}/${gid}-${index}`;
        let re = await this.request(url, "GET");
        if (re.status != 200) {
            throw new Error(`Fetch ${url} failed, status ${re.status} ${re.statusText}`);
        }
        return new SinglePage(await re.text(), this);
    }
}
