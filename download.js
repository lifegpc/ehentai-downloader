import { load_settings } from './config.js';
import { Client } from './client.js';
import getopts from 'getopts';
import { parseUrl } from './url.js';
import { DownloadManager } from './download_manager.js';


function show_help() {
    console.log("Usage: download.js [options] download <url>...");
    console.log("Options:");
    console.log("  -h, --help           Show this help");
    console.log("  -c, --config <PATH>  Specify config file path.");
    console.log("  --original           Download original image.");
    process.exit(0);
}

async function download() {
    let config = await load_settings();
    let client = new Client(config);
    let download_original = options.original || config.original;
    for (const url of options._.slice(1)) {
        let u = parseUrl(url);
        if (u.type == 'single') {
            let data = await client.fetchSignlePage(u.gid, u.page_token, u.index);
            let manager = new DownloadManager(data.gid, config.base);
            await manager.init();
            async function downloadCur(cur) {
                if (download_original) {
                    if (!manager.is_original_in_cache(cur.currentIndex)) {
                        await manager.download_original_img(cur.original_url || cur.img_url, cur.currentIndex, client);
                    }
                }
            }
            await downloadCur(data);
            let cur = data;
            while (true) {
                cur = await cur.prevPage();
                if (cur === undefined) break;
                await downloadCur(cur)
            }
            cur = data;
            while (true) {
                cur = await cur.nextPage();
                if (cur === undefined) break;
                await downloadCur(cur);
            }
        }
    }
}

const options = getopts(process.argv.slice(2), {
    alias: {
        config: ["c"],
        help: ["h"],
    },
    boolean: ["help", "original"],
    default: {
        config: "./config.json"
    },
    string: ["config"],
    unknown: (opt) => {
        if (['download', 'd'].indexOf(opt) != -1) {
            return true;
        }
        return parseUrl(opt) != undefined;
    }
})
if (!options._.length || options.help) {
    show_help();
}
let command = options._[0];
if (command == 'download' || command == 'd') {
    download().catch((r) => {
        console.error(r);
        process.exit(1);
    })
}
