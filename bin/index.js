"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knict_fetch_1 = require("knict-fetch");
const xml2json_1 = __importDefault(require("xml2json"));
const fs_1 = __importDefault(require("fs"));
const CLI = __importStar(require("knict-cli"));
const path_1 = __importDefault(require("path"));
const { GET, Path } = knict_fetch_1.HttpMethod;
const UnSupportPromise = () => {
    return Promise.resolve("Not Support");
};
class RssDataService {
    feed() {
        return UnSupportPromise();
    }
}
__decorate([
    GET("{feed}"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RssDataService.prototype, "feed", null);
// console.info = () => {
// }
class RssClientService {
    rss(url) {
        return {};
    }
    home(items) {
        return {};
    }
    menuwithback(items) {
        return {};
    }
}
__decorate([
    CLI.CliMethod.Input(),
    __param(0, CLI.CliMethod.Str("url")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], RssClientService.prototype, "rss", null);
__decorate([
    CLI.CliMethod.MutableChoice(),
    __param(0, CLI.CliMethod.MutableChoiceList("items")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Object)
], RssClientService.prototype, "home", null);
__decorate([
    CLI.CliMethod.MutableChoice(),
    __param(0, CLI.CliMethod.MutableChoiceList("items")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Object)
], RssClientService.prototype, "menuwithback", null);
class RssData {
    constructor(baseUrl) {
        this.dataPath = path_1.default.join((process.env.HOME || process.env.USERPROFILE), '.kfmerss_rssdata');
        this.baseUrl = "";
        this.hasLocal = (url) => {
            if (fs_1.default.existsSync(this.dataPath)) {
                const content = fs_1.default.readFileSync(this.dataPath, { encoding: 'utf-8' });
                let obj = {};
                try {
                    obj = JSON.parse(content);
                }
                catch (err) {
                    // console.error('hasLocal', err)
                }
                // console.info('obj[url]', url, obj[url])
                if (obj[url] !== undefined && obj[url] !== '') {
                    return true;
                }
            }
            return false;
        };
        this.getLocal = (url) => {
            const content = fs_1.default.readFileSync(this.dataPath, { encoding: 'utf-8' });
            const obj = JSON.parse(content);
            return obj[url];
        };
        this.saveLocal = (url, value) => {
            let content = "{}";
            if (fs_1.default.existsSync(this.dataPath)) {
                content = fs_1.default.readFileSync(this.dataPath, { encoding: 'utf-8' });
            }
            let obj = {};
            try {
                obj = JSON.parse(content);
            }
            catch (err) {
                // console.error(err)
            }
            obj[url] = value;
            fs_1.default.writeFileSync(this.dataPath, JSON.stringify(obj));
        };
        this.setRemoteCall = (remoteFunc) => {
            this.remoteCallFunc = remoteFunc;
        };
        this.getRemote = (url) => {
            if (!this.remoteCallFunc) {
                return Promise.reject("");
            }
            return new Promise((resolve, reject) => {
                this.remoteCallFunc(url).then((res) => {
                    this.saveLocal(url, res.data);
                    resolve(res.data);
                }).catch(reject);
            });
        };
        this.baseUrl = baseUrl;
    }
    get(url, remote = true) {
        url = this.baseUrl + url;
        return new Promise((resolve, reject) => {
            if (this.hasLocal(url)) {
                // console.info('get', url, 'hasLocal')
                resolve(this.getLocal(url));
            }
            else {
                if (remote) {
                    this.getRemote(url).then(resolve).catch((res) => {
                        console.error(res);
                        resolve('');
                    });
                }
                else {
                    resolve('');
                }
            }
        });
    }
    getList(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let valueRes = [];
            try {
                let value = yield this.get(url, false);
                // console.info('getList', url, value)
                valueRes = JSON.parse(value).data;
                return valueRes;
            }
            catch (err) {
                console.error('getList err', err);
            }
            // console.info('getList', url, valueRes)
            return valueRes;
        });
    }
    saveList(url, val) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = { data: val };
            this.saveLocal(url, JSON.stringify(body));
        });
    }
}
class RssClientBuilder extends knict_fetch_1.FetchClientBuilder {
    constructor(opt) {
        super();
        if (opt.url) {
            const baseUrlReg = /(https?:\/\/.*\/)/;
            const res = baseUrlReg.exec(opt.url);
            if (res != null) {
                opt.baseUrl = res[1];
                opt.feed = opt.url.replace(opt.baseUrl, "");
            }
            else {
                console.error("rssClient param error");
            }
        }
        this.feed = opt.feed;
        this.baseUrl(opt.baseUrl);
        this.data = new RssData(opt.baseUrl);
    }
    build(k) {
        k.url = k.url.replace(`\{feed\}`, this.feed);
        if (k.name == 'feed') {
            this.data.setRemoteCall((url) => {
                // k.url = url;
                return this.handleGet(k);
            });
            return (() => {
                return this.data.get(this.feed);
            })();
        }
        // return (() => {
        //     return this.handleGet(k);
        // })()
    }
}
const rssClient = knict_fetch_1.Knict.builder(new CLI.CliClientBuilder()).create(new RssClientService());
let menuStack = [];
const menu = (obj) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(menuStack.length);
    let menuItems = [];
    for (let x in obj) {
        menuItems.push("[" + typeof obj[x] + ']' + x);
    }
    menuItems.push('back');
    let { menuwithback } = yield rssClient.menuwithback(menuItems);
    // console.info('menuwithback res', menuwithback)
    const callback = () => {
        if (menuStack.length > 0) {
            menu(menuStack.pop());
        }
        else {
            main();
        }
    };
    if (menuwithback === 'back') {
        callback();
    }
    else {
        menuwithback = menuwithback.split(']')[1];
        if (typeof obj[menuwithback] === 'object') {
            // console.info('choose a object')
            let hasObj = false;
            for (let y in obj[menuwithback]) {
                if (typeof obj[menuwithback][y] === 'object') {
                    hasObj = true;
                }
            }
            menuStack.push(obj);
            if (hasObj) {
                yield menu(obj[menuwithback]);
            }
            else {
                // console.info('but show hold obj', obj[menuwithback])
                console.info(obj[menuwithback]);
                callback();
            }
        }
        else {
            // console.info('choose a string', obj[menuwithback])
            menuStack.push(obj);
            callback();
        }
    }
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    // console.info('main')
    let homeChios = ['new'];
    const rssCliData = new RssData('cli');
    let cacheData = yield rssCliData.getList('homeChios');
    homeChios = cacheData.concat(homeChios);
    let rssDataClients = {};
    // console.info('homeChios', homeChios)
    const { home } = yield rssClient.home(homeChios);
    // let res: any = await ddeville.feed();
    if (home === 'new') {
        const { url } = yield rssClient.rss('your ssr url');
        cacheData = yield rssCliData.getList('homeChios');
        cacheData.push(url);
        // console.info('cacheData,', cacheData)
        rssCliData.saveList('clihomeChios', cacheData);
        main();
    }
    else {
        let client = rssDataClients[home];
        console.info('rss home ', home);
        if (client === undefined) {
            client = knict_fetch_1.Knict.builder(new RssClientBuilder({ url: home })).create(new RssDataService());
            rssDataClients[home] = client;
        }
        const res = yield client.feed();
        try {
            let data = JSON.parse(xml2json_1.default.toJson(res));
            yield menu(data);
        }
        catch (err) {
            console.error(err);
            console.info(res);
            yield main();
        }
        // await main()
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    main();
    // const { url} = await rssClient.rss('https://ddeville.me/feed.xml')
    // const ddeville = Knict.builder(new RssClientBuilder({ url })).create(new RssDataService())
    // ddeville.feed().then(res => {
    //     let data:any = JSON.parse(parser.toJson(res))
    //     console.info(data.feed.entry)
    //     // for(let x in data) {
    //     //     console.info(data)
    //     // }
    // })
    // fs.writeFileSync("res.xml", res.data)
}))();
