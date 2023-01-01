import fs from 'fs/promises';

export class Config {
    constructor(data) {
        this._data = Object.assign({}, data);
    }
    /**@returns {undefined | string} */
    _return_string(key) {
        let v = this._data[key];
        if (v === undefined || typeof v === 'string') {
            return v;
        }
        throw new Error(`Config ${key} value ${v} is not a string`);
    }
    /**@returns {boolean | undefined} */
    _return_bool(key) {
        let v = this._data[key];
        if (v === undefined) {
            return v;
        }
        let t = typeof v;
        if (t === "boolean") {
            return v;
        } else if (t === "string") {
            if (v === "true") {
                return true;
            } else if (v === "false") {
                return false;
            }
        } else if (t === "number") {
            return v != 0;
        }
        throw new Error(`Config ${key} value ${v} is not a boolean`);
    }
    get cookies() {
        return this._return_string("cookies");
    }
    get ua() {
        return this._return_string("ua");
    }
    get ex() {
        return this._return_bool("ex") || false;
    }
    get original() {
        return this._return_bool("original") || false;
    }
    get base() {
        return this._return_string("base") || "./downloads";
    }
}

export async function load_settings(fn = "./config.json") {
    let text = await fs.readFile(fn, { encoding: 'utf-8' });
    return new Config(JSON.parse(text));
}
