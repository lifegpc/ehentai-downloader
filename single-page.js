import { JSDOM } from 'jsdom';
import { Client } from './client.js';
import { indirectEval } from './eval.js';
import { parseUrl } from './url.js';

export class SinglePage {
    /**
     * @param {string} html
     * @param {Client} client
     */
    constructor(html, client) {
        this._dom = new JSDOM(html);
        this.window = this._dom.window;
        this.document = this.window.document;
        this._meta = undefined;
        this._gid = undefined;
        this._client = client;
    }
    async load_image(url) {
        let re = await this._client.request(url, "GET");
        if (re.status != 200) {
            throw new Error(`Fetch ${url} failed, status ${re.status} ${re.statusText}`);
        }
        return new SinglePage(await re.text(), this._client);
    }
    get currentIndex() {
        return parseInt(this.document.querySelector('#i2>div span').innerHTML);
    }
    /**@returns {number}*/
    get gid() {
        if (this._gid === undefined) {
            this._gid = indirectEval(`${this.meta};gid`);
        }
        return this._gid;
    }
    get img_url() {
        let img = this.document.querySelector('#img');
        return img.getAttribute('src')
    }
    get meta() {
        if (this._meta === undefined) {
            let scripts = this.document.getElementsByTagName('script');
            for (const script of scripts) {
                if (script.innerHTML.startsWith('var')) {
                    this._meta = script.innerHTML;
                    break;
                }
            }
        }
        return this._meta;
    }
    async nextPage() {
        let url = this.nextPageUrl;
        if (url == undefined) return undefined;
        return this.load_image(url);
    }
    get nextPageUrl() {
        if (this.currentIndex == this.pageCount) return undefined;
        let a = this.document.getElementById('next');
        if (a == null) return undefined;
        return a.getAttribute('href')
    }
    get original_url() {
        let a = this.document.querySelector('#i7 a');
        if (a == null) return null
        return a.getAttribute('href')
    }
    get pageCount() {
        return parseInt(this.document.querySelector('#i2>div span:last-child').innerHTML);
    }
    async prevPage() {
        let url = this.prevPageUrl;
        if (url == undefined) return undefined;
        return this.load_image(url);
    }
    get prevPageUrl() {
        if (this.currentIndex == 1) return undefined;
        let a = this.document.getElementById('prev');
        if (a == null) return undefined;
        return a.getAttribute('href')
    }
}
