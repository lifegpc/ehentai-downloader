/**@param {string} url*/
export function parseUrl(url) {
    let u = new URL(url, "https://e-hentai.org/");
    if (u.hostname != "e-hentai.org" && u.hostname != "exhentai.org") {
        return undefined;
    }
    let re = u.pathname.match(/s\/([^\/]+)\/(\d+)-(\d+)/);
    if (re != null) {
        return { type: 'single', gid: parseInt(re[2]), page_token: re[1], index: parseInt(re[3]) };
    }
    return undefined;
}
