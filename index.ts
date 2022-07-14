import { HttpMethod, Knict, FetchClientBuilder } from 'knict-fetch'
import parser from 'xml2json'
import fs from 'fs'
import * as CLI from 'knict-cli'
import path from 'path'

const { GET, Path } = HttpMethod

const UnSupportPromise = () => {
    return Promise.resolve("Not Support")
}
class RssDataService {

    @GET("{feed}")
    feed(): Promise<any> {
        return UnSupportPromise()
    }
}

// console.info = () => {

// }



class RssClientService {

    @CLI.CliMethod.Input()
    rss(@CLI.CliMethod.Str("url") url: string): any {
        return {}
    }

    @CLI.CliMethod.MutableChoice()
    home(@CLI.CliMethod.MutableChoiceList("items") items: string[]):any {
        return {}
    }

    @CLI.CliMethod.MutableChoice()
    menuwithback(@CLI.CliMethod.MutableChoiceList("items") items: string[]):any {
        return {}
    }
}

class RssData {
    dataPath = path.join((process.env.HOME || process.env.USERPROFILE)!!, '.kfmerss_rssdata')

    remoteCallFunc: Function | undefined
    baseUrl: string = ""
    constructor(baseUrl:string) {
        this.baseUrl = baseUrl
    }

    get(url: string, remote: boolean = true) {
        url = this.baseUrl + url
        return new Promise<string>((resolve, reject) => {
            if (this.hasLocal(url)) {
                // console.info('get', url, 'hasLocal')
                resolve(this.getLocal(url))
            } else {
                if (remote) {
                    this.getRemote(url).then(resolve).catch((res:any) => {
                        console.error(res)
                        resolve('')
                    })
                } else {
                    resolve('')
                }
            }
        })
    }

    async getList(url:string) {
        let valueRes = []
        try {

        let value:string = await this.get(url, false)
            // console.info('getList', url, value)
            valueRes = JSON.parse(value).data
            return valueRes
        } catch(err) {
            console.error('getList err', err)
        }
        // console.info('getList', url, valueRes)
        return valueRes
    }

    async saveList(url:string, val: any[]) {
        const body = { data: val}
        this.saveLocal(url, JSON.stringify(body))
    }

    hasLocal = (url: string): boolean => {
        
        if (fs.existsSync(this.dataPath)) {
            const content = fs.readFileSync(this.dataPath, { encoding: 'utf-8' })

            let obj: any = {}
            try {
                obj = JSON.parse(content)
            } catch (err) {
                // console.error('hasLocal', err)
            }
            // console.info('obj[url]', url, obj[url])
            if (obj[url] !== undefined && obj[url] !== '') {
                return true
            }
        }
        return false
    }

    getLocal = (url: string): string => {
        const content = fs.readFileSync(this.dataPath, { encoding: 'utf-8' })
        const obj = JSON.parse(content)
        return obj[url]!!
    }

    saveLocal = (url: string, value: string): void => {
        let content = "{}"
        if (fs.existsSync(this.dataPath)) {
            content = fs.readFileSync(this.dataPath, { encoding: 'utf-8' })
        }
        let obj: any = {}
        try {
            obj = JSON.parse(content)
        } catch (err) {
            // console.error(err)
        }
        obj[url] = value
        fs.writeFileSync(this.dataPath, JSON.stringify(obj))
    }

    setRemoteCall = (remoteFunc: Function) => {
        this.remoteCallFunc = remoteFunc
    }

    getRemote = (url: string): Promise<string> => {
        if (!this.remoteCallFunc) {
            return Promise.reject("")
        }

        return new Promise((resolve, reject) => {
            this.remoteCallFunc!!(url).then((res:any) => {
                this.saveLocal(url, res.data)
                resolve(res.data)
            }).catch(reject)
        })
    }
}

class RssClientBuilder extends FetchClientBuilder {
    feed: string | undefined

    data: RssData | undefined

    constructor(opt: { baseUrl?: string, feed?: string, url: string }) {
        super()
        if (opt.url) {
            const baseUrlReg = /(https?:\/\/.*\/)/
            const res = baseUrlReg.exec(opt.url)
            if (res != null) {
                opt.baseUrl = res[1]
                opt.feed = opt.url.replace(opt.baseUrl, "")
            } else {
                console.error("rssClient param error")
            }
        }
        this.feed = opt.feed!!
        this.baseUrl(opt.baseUrl!!)
        this.data = new RssData(opt.baseUrl!!)
    }
    build(k: any) {
        k.url = k.url.replace(`\{feed\}`, this.feed);
        if (k.name == 'feed') {
            this.data!!.setRemoteCall((url: string) => {
                // k.url = url;
                return this.handleGet(k)
            })
            return (() => {
                return this.data!!.get(this.feed!!)
            })()
        }
        // return (() => {
        //     return this.handleGet(k);
        // })()
    }
}

const rssClient = Knict.builder(new CLI.CliClientBuilder()).create(new RssClientService())

let menuStack:any[] = []
const menu = async (obj:any) => {
    console.info(menuStack.length)
    let menuItems = []
    for (let x in obj) {
        menuItems.push("[" +typeof obj[x] + ']' + x)
    }
    menuItems.push('back')
    let {menuwithback} = await rssClient.menuwithback(menuItems)
    // console.info('menuwithback res', menuwithback)
    const callback = () => {
        if (menuStack.length > 0) {
            menu(menuStack.pop())
        } else {
            main()
        }
    }
    if (menuwithback === 'back') {
        callback()
    } else {
        menuwithback = menuwithback.split(']')[1]
        if (typeof obj[menuwithback] === 'object') {
            // console.info('choose a object')
            let hasObj = false
            for (let y in (obj[menuwithback] as any)) {
                if (typeof obj[menuwithback][y] === 'object') {
                    hasObj = true
                }
            }

            menuStack.push(obj)
            if (hasObj) {
                await menu(obj[menuwithback])
            } else {
                // console.info('but show hold obj', obj[menuwithback])
                console.info(obj[menuwithback])
                callback()
            }

        } else {
            // console.info('choose a string', obj[menuwithback])
            menuStack.push(obj)
            callback()
        }
    }
}

const main = async() => {
    // console.info('main')
    let homeChios = ['new']
    const rssCliData = new RssData('cli')
    let cacheData: string[] = await rssCliData.getList('homeChios')
    homeChios = cacheData.concat(homeChios)

    let rssDataClients:any = {}
    // console.info('homeChios', homeChios)
    const { home } = await rssClient.home(homeChios)
    // let res: any = await ddeville.feed();
    if (home === 'new') {
        const { url } = await rssClient.rss('your ssr url')
        cacheData = await rssCliData.getList('homeChios')
        cacheData.push(url)
        // console.info('cacheData,', cacheData)
        rssCliData.saveList('clihomeChios', cacheData)
        main()
    } else {
        let client:RssDataService| undefined = rssDataClients[home]
        console.info('rss home ', home)
        if (client === undefined) {
            client = Knict.builder(new RssClientBuilder({ url: home })).create(new RssDataService())
            rssDataClients[home] = client
        } 
        const res = await client.feed()
        try {

            let data:any = JSON.parse(parser.toJson(res))
            await menu(data)
        } catch (err) {
            console.error(err)
            console.info(res)
            await main()
        }
        // await main()
    }
}

(async () => {

    main()

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
})()