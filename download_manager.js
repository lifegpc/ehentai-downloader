import fs from 'fs/promises'
import { Client } from './client.js';
import { exists } from './fs.js';

export class DownloadManager {
    /**
     * @param {number} gid
     * @param {string} base
     */
    constructor(gid, base) {
        this._gid = gid;
        this._base = base;
        this._data = {};
    }
    get dir() {
        return `${this._base}/${this._gid}`;
    }
    get json_dir() {
        return `${this.dir}/caches.json`;
    }
    async create_dir() {
        let existed = await exists(this.dir);
        if (existed) {
            let status = await fs.stat(this.dir);
            if (status.isDirectory()) {
                return;
            }
        }
        await fs.mkdir(this.dir, { recursive: true });
    }
    /**@param {Client} client*/
    async download_original_img(url, index, client) {
        let re = await client.request(url, "GET");
        if (re.status != 200) {
            throw new Error(`Download ${url} failed, status ${re.status} ${re.statusText}`);
        }
        function get_file_name() {
            if (re && re.headers.has("content-disposition")) {
                let v = re.headers.get("content-disposition");
                let s = v.split("filename=");
                if (s.length > 1) return s[1].trim();
            }
            return `${index}.jpg`;
        }
        let file_name = get_file_name();
        let buffer = await re.arrayBuffer();
        let file_path = `${this.dir}/${file_name}`;
        await fs.writeFile(file_path, Buffer.from(buffer));
        this._data[index] = this._data[index] || {};
        this._data[index]["original"] = { "url": url, "name": file_name };
        await this.write_json();
    }
    is_original_in_cache(index) {
        let d = this._data[index];
        if (d === undefined) return false;
        let d2 = d["original"];
        return d2 !== undefined;
    }
    async read_json() {
        let existed = await exists(this.json_dir);
        if (existed) {
            let text = await fs.readFile(this.json_dir, { encoding: 'utf-8' });
            this._data = JSON.parse(text);
        }
    }
    async write_json() {
        await fs.writeFile(this.json_dir, JSON.stringify(this._data), { encoding: 'utf-8' });
    }
    async init() {
        await this.create_dir();
        await this.read_json();
    }
}
