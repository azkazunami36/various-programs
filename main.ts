import express from "express"
import fs from "fs"
import ytdl from "ytdl-core"
import ytch from "yt-channel-info"
import querystring from "querystring"
import readline from "readline"

function addNestedProperties(mlist: string[], mdest: {}, write?: { name: string, data: any }) {
    let dest: {} = mdest
    let list: string[] = JSON.parse(JSON.stringify(mlist))
    while (list.length !== 0) {
        if (!(list[0] in dest)) dest[list[0]] = {}
        dest = dest[list[0]]
        list = list.slice(1)
    }
    if (write) dest[write.name] = write.data
}
let dest = {
    data: {
        video: {
            pass: ""
        }
    }
}
console.dir(dest)
addNestedProperties(["data", "audio"], dest, { name: "pass", data: "/Users/" })
addNestedProperties(["data", "audio"], dest, { name: "data", data: "videos" })
addNestedProperties(["data", "video"], dest, { name: "users", data: "kazun" })
addNestedProperties(["data", "video"], dest)
addNestedProperties(["data", "universal"], dest)
addNestedProperties(["data", "video"], dest, { name: "pass", data: "やあ" })
console.dir(dest)
process.exit(0)

const smartLog: {
    title: string,
    body: string,
    id?: string,
    data?: any
}[] = []

namespace ytchInterface {
    interface RelatedChannel {
        channelName: string;
        channelId: string;
        channelUrl: string;
        thumbnail: Image[];
        videoCount: number;
        subscriberText: string;
        subscriberCount: number;
        verified: boolean;
        officialArist: boolean;
    }

    /**
     * ChannelInfo type returned by getChannelVideos and getChannelInfoMore
     */
    export interface ChannelInfo {
        author: string;
        authorId: string;
        authorUrl: string;
        /**
        * Is null if none exist
        **/
        authorBanners: Image[] | null;
        /**
        * Is null if none exist
        **/
        authorThumbnails: Image[] | null;
        subscriberText: string;
        subscriberCount: number;
        description: string;
        isFamilyFriendly: boolean;
        relatedChannels: RelatedChannel[];
        allowedRegions: string[];
        isVerified: boolean;
        isOfficialArtist: boolean;
        tags: string[];
        channelIdType: number;
        channelTabs: string[];
        alertMessage: string;
        channelLinks: {
            primaryLinks: ChannelLink[],
            secondaryLinks: ChannelLink[]
        }
    }

    interface ChannelLink {
        url: string,
        icon: string,
        title: string
    }

    /**
     * An Image which represents all banners and thumbnails
     */
    interface Image {
        url: string;
        height: number;
        width: number;
    }
}

namespace youtube {
    enum VAType {
        video,
        audio
    }

    const codec = [
        {
            full: "h264.mp4",
            codec: "h264",
            ffmpegOption: [
                "-c:v libx264"
            ],
            contentType: "video/mp4",
            type: VAType.video
        },
        {
            full: "h265.hevc",
            codec: "h265",
            ffmpegOption: [
                "-c:v libx265"
            ],
            contentType: "video/hevc",
            type: VAType.video
        },
        {
            full: "vp9.webm",
            codec: "vp9",
            ffmpegOption: [
                "-c:v libvpx-vp9"
            ],
            contentType: "video/webm",
            type: VAType.video
        },
        {
            full: "av1.webm",
            codec: "av1",
            ffmpegOption: [
                "-c:v libaom-av1"
            ],
            contentType: "video/webm",
            type: VAType.video
        },
        {
            full: "aac.aac",
            codec: "aac",
            ffmpegOption: [
                "-vn",
                "-c:a aac"
            ],
            contentType: "audio/aac",
            type: VAType.audio
        },
        {
            full: "opus.opus",
            codec: "opus",
            ffmpegOption: [
                "-vn",
                "-c:a libopus"
            ],
            contentType: "audio/opus",
            type: VAType.audio
        }
    ]
}

namespace server {
    /**
     * 送信する際に使用する値をここに格納します。
     */
    interface settings {
        /**
         * 送信時に使用するヘッダーです。
         */
        headers: {
            "Content-Type"?: string,
            "Content-Length"?: string,
            "Accept-Ranges"?: string,
            "Content-Range"?: string
        },
        /**
         * ステータスコードです。
         */
        statusCode: 200 | 204 | 206 | 400 | 404 | 500,
        /**
         * ファイルパスです。
         */
        pass: string,
        /**
         * res.end()の中に入れるデータをここに格納します。
         */
        resData?: string,
        /**
         * ファイルの読み込む範囲を設定する際にここに情報を書き込みます。
         */
        range?: {
            /**
             * 範囲の最初を指定
             */
            start: number,
            /**
             * 範囲の最後を指定
             */
            end: number
        }
    }
    /**
     * コンテンツタイプ
     */
    enum contentType {
        html = "text/html;charset=utf-8",
        plain = "text/plain;charset=utf-8",
        jpeg = "image/jpeg",
        webm = "video/webm",
        mp4 = "video/mp4",
        aac = "audio/aac",
        opus = "audio/opus",
        json = "application/json"
    }
    const processJson = {
        "Apps": [
            {
                "name": "Virtual Desktop",
                "id": "virtualdesktop",
                "compact": "vd",
                "iconURL": "",
                "status": {
                    "loaded": false,
                    "viewed": false
                }
            },
            {
                "name": "YouTube Downloader",
                "id": "youtubedownloader",
                "compact": "ytdl",
                "iconURL": "",
                "status": {
                    "loaded": false,
                    "viewed": false
                }
            },
            {
                "name": "Discord Bot",
                "id": "discordbot",
                "compact": "ggbot",
                "iconURL": "",
                "status": {
                    "loaded": false,
                    "viewed": false
                }
            },
            {
                "name": "FFmpeg Converter",
                "id": "ffmpegconverter",
                "compact": "ffcvr",
                "iconURL": "",
                "status": {
                    "loaded": false,
                    "viewed": false
                }
            },
            {
                "name": "JSON Data Server",
                "id": "jsondataserver",
                "compact": "jsonds",
                "iconURL": "",
                "status": {
                    "loaded": false,
                    "viewed": false
                }
            },
            {
                "name": "File",
                "id": "filelister",
                "compact": "flst",
                "iconURL": "",
                "status": {
                    "loaded": false,
                    "viewed": false
                }
            },
            {
                "name": "Remote File Move",
                "id": "remotefilemove",
                "compact": "flmv",
                "iconURL": "",
                "status": {
                    "loaded": false,
                    "viewed": false
                }
            }
        ]
    }

    const memory: {
        savePass?: string | null
    } = {}

    const app = express() //本体
    app.listen(80, async () => console.log("サーバーが立ち上がりました。"))

    app.get("*", async (req, res) => {
        const url = req.url.split("/") //階層の配列にします。(？)
        let paramString = url[url.length - 1].split("?") //?より先にあるパラメーターを分割します
        let param: querystring.ParsedUrlQuery | null //パラメーターが入ります。入らない時もあります
        if (paramString[1]) { //パラメーターが存在する場合に実行します。
            url[url.length - 1] = paramString[0] //url配列の最後?より前の文字列だけを入れる。これでパラメーターはurlから消える
            param = querystring.parse(paramString[1]) //パラメーターをjson化する
        }
        const settings: settings = { //アクセスの際に使用する情報をここに格納する
            headers: {},
            statusCode: 500,
            pass: ""
        }
        if (!url[url.length - 1]) url[url.length - 1] = "index.html" //スラッシュより先がない場合は必然的にindex.htmlになる
        if (url[1] === "sources") {
            for (let i: number = 1; i != url.length; i++) {
                settings.pass += url[i]
                if (i !== (url.length - 1)) settings.pass += "/"
            }
            settings.statusCode = 200
        }
        const extension = url[url.length - 1].split(".")[1]
        switch (extension) {
            case "html": settings.headers["Content-Type"] = contentType.html; break
            case "jpg": settings.headers["Content-Type"] = contentType.jpeg; break
            case "mp4": settings.headers["Content-Type"] = contentType.mp4; break
            case "webm": settings.headers["Content-Type"] = contentType.webm; break
            case "aac": settings.headers["Content-Type"] = contentType.aac; break
            case "opus": settings.headers["Content-Type"] = contentType.opus; break
            default: settings.headers["Content-Type"] = contentType.plain; break
        }
        if (!fs.existsSync(settings.pass)) settings.statusCode = 400
        if (settings.statusCode !== 400) {
            const length = fs.statSync(settings.pass).size
            settings.range.start = 0
            settings.range.end = length
            settings.headers["Content-Length"] = String(length)
            settings.headers["Accept-Ranges"] = "bytes"
            if (req.headers.range) {
                console.log("Range利用")
                const chunkSize = 1e7
                const ranges = String(req.headers.range).split("-")
                if (ranges[0]) ranges[0] = ranges[0].replace(/\D/g, "")
                if (ranges[1]) ranges[1] = ranges[1].replace(/\D/g, "")

                settings.range.start = Number(ranges[0]) //始まりの指定
                settings.range.end = Number(ranges[1] || Math.min(settings.range.start + chunkSize, length - 1)) //終わりの指定
                settings.headers["Content-Length"] = String(settings.range.end - settings.range.start + 1)
                settings.headers["Content-Range"] = "bytes " + settings.range.start + "-" + settings.range.end + "/" + length
                settings.statusCode = 206
            }
            res.writeHead(settings.statusCode, settings.headers)
            const Stream = fs.createReadStream(settings.pass, (settings.range) ? settings.range : null)
            Stream.on("data", chunk => res.write(chunk))
            Stream.on("end", () => res.end())
            Stream.on("error", e => {
                settings.statusCode = 500
                res.sendStatus(settings.statusCode)
            })
        } else {
            res.writeHead(settings.statusCode, settings.headers)
            res.end()
        }
        console.log("Get  " + settings.statusCode + ": ", req.url)
    })

    app.post("*", async (req, res) => {
        const settings: settings = {
            headers: {},
            statusCode: 500,
            pass: "",
            resData: ""
        }
        settings.headers["Content-Type"] = contentType.plain
        let dataTemp = ""
        req.on("data", chunk => dataTemp += chunk)
        req.on("end", () => {
            const data: {
                name: string,
                sub: string,
                data: any
            } = JSON.parse(String(dataTemp))
            if (data.name === "ytdl") {

            }
        })
        console.log("Post " + settings.statusCode + ": " + req.url)
        res.writeHead(settings.statusCode, settings.headers)
        res.end(settings.resData)
    })
}
/**
 * データを管理する際に使用します。
 * 動作が高速になるよう設計しています。
 */
namespace sourceManagement {
    interface constructor {
        /**
         * データを管理する際に使用するフォルダを指定します。
         * ¥には対応していません。必ず/を使用してください。
         * いずれ対応しますが、予定はありません。
         */
        pass: string
    }
    interface pointsExp {
        mark: string[],
        extension?: string | null
    }
    function addNestedProperties(mlist: string[], mdest: {}, write?: { name: string, data: any }) {
        let dest: {} = mdest
        let list: string[] = JSON.parse(JSON.stringify(mlist))
        while (list.length !== 0) {
            if (!(list[0] in dest)) dest[list[0]] = {}
            dest = dest[list[0]]
            list = list.slice(1)
        }
        if (write) dest[write.name] = write.data
    }
    /**
     * 主役です。
     */
    class sourceManager {
        /**
         * クラスが利用可能かを決定します。
         * falseの場合は全ての要求をスルーします。
         */
        status = false
        /**
         * jsonやソースなどの保存先を格納します。
         */
        pass = ""
        /**
         * ソースの保存先を格納します。
         */
        points = {}
        /**
         * jsonテキストデータを格納します。
         */
        textData = {}
        /**
         * ソースの追加情報を格納します。
         */
        pointTags = {}
        constructor(pass: string) {
            let splited = pass.split("/")
            let splitToPass = ""
            for (let i = 0; i != splited.length; i++) {
                if (splitToPass != "" && splited[i] != "") splitToPass += "/"
                splitToPass += splited[i]
            }
            if (fs.existsSync(splitToPass)) {
                this.pass = splitToPass //パス位置を設定します。
                const jsonfile = ["passpoints", "textdata", "passtag"] //作成するjsonファイルの名前を格納します。
                for (let i = 0; i != jsonfile.length; i++) {
                    if (!fs.existsSync(this.pass + "/" + jsonfile[i] + ".json")) //jsonファイルがない場合
                        fs.writeFileSync(this.pass + "/" + jsonfile[i] + ".json", "{}") //作成します
                }
                this.points = JSON.parse(String(fs.readFileSync(this.pass + "/passpoints.json"))) //データを読み込みます。
                this.textData = JSON.parse(String(fs.readFileSync(this.pass + "/textdata.json"))) //省略
                this.pointTags = JSON.parse(String(fs.readFileSync(this.pass + "/passtag.json")))
                this.status = true //利用可能にします。
            }
        }
        passCreate(request: pointsExp, data: { [_: string]: any } | null) {
            let json: any = this.points
            for (let i = 0; i != request.mark.length; i++) {
                json = json[request.mark[i]]
                if (!json) json = {}
            }
        }
    }
}
