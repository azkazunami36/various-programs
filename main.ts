import express from "express"
import fs from "fs"
import ytdl from "ytdl-core"
import ytch from "yt-channel-info"
import querystring from "querystring"
import readline from "readline"

if (!fs.existsSync("passCache.json"))
    throw "jsonファイル「passCache.json」を作成し、データを保存する場所を指定してください。「/pass/pass」という形で書き込んでください。Windowsの場合も「C:/User/pass」という形で書き込む必要があります。"
if (!fs.existsSync(JSON.parse(String(fs.readFileSync("passCache.json"))).pass))
    throw "データを保存するパス名が間違っています。jsonファイルを再設定をしてください。「/pass/pass」という形で書き込んでください。Windowsの場合も「C:/User/pass」という形で書き込む必要があります。"
else {
    const pass: string = JSON.parse(String(fs.readFileSync("passCache.json"))).pass + "/Various-Programs-Data"
    if (!fs.existsSync(pass)) fs.mkdirSync(pass)
}

const savePass: string = JSON.parse(String(fs.readFileSync("passCache.json"))).pass + "/Various-Programs-Data/"

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
    interface cacheYTDL {
        videoRawInfo: {
            [videoId: string | null]: {
                history: {
                    data: ytdl.VideoDetails | null,
                    time: number
                }[],
                savedDataPass: {
                    h264: string | null | false,
                    h265: string | null | false,
                    vp9: string | null | false,
                    av1: string | null | false,
                    aac: string | null | false,
                    opus: string | null | false,
                    converted: {
                        mp4: {
                            vcodec: string | null | false,
                            acodec: string | null | false,
                            pass: string | null | false
                        },
                        hevc: {
                            vcodec: string | null | false,
                            acodec: string | null | false,
                            pass: string | null | false
                        },
                        webm: {
                            vcodec: string | null | false,
                            acodec: string | null | false,
                            pass: string | null | false
                        }
                    }
                }
            }
        },
        channelRawInfo: {
            [authorId: string | null]: ytchInterface.ChannelInfo | null
        },
        index?: {
            videoIds: {
                [videoId: string]: {
                    title: string,
                    author: {
                        id: string,
                        name: string
                    }
                }
            },
            authorIds: {
                [authorId: string]: {}
            }
        }
    }
    export class CachePass {
        ytcache: cacheYTDL = {
            videoRawInfo: {},
            channelRawInfo: {}
        }
        videoIds: string[] = []
        constructor() {
            if (!fs.existsSync(savePass + "YouTube-Downloader.json")) {
                fs.writeFileSync(savePass + "YouTube-Downloader.json", "{}")
                smartLog.push({
                    title: "YouTube-Downloader.jsonの作成",
                    body: "JSONファイルが存在しなかったため、作成しました。",
                    id: "filecreate"
                })
            }
            this.videoIds = JSON.parse(String(fs.readFileSync(savePass + "YouTube-Downloader.json")))
            if (!fs.existsSync(savePass + "YouTube-CacheData.json"))
                fs.writeFileSync(savePass + "YouTube-CacheData.json", JSON.stringify(this.ytcache))
            const data: cacheYTDL = JSON.parse(String(fs.readFileSync(savePass + "YouTube-CacheData.json")))
            if (data.videoRawInfo) this.ytcache.videoRawInfo = data.videoRawInfo
            if (data.channelRawInfo) this.ytcache.channelRawInfo = data.channelRawInfo
        }
        youtubedl(videoId: string, type: number) {
            let starttime: number
            const download = ytdl(videoId, { filter: ((type !== 1) ? "videoonly" : "audioonly"), quality: "highest" })
            download.once("response", () => {
                if (starttime === null) starttime = Date.now()
            })
        }
        getAuthorImage(authorId: string, param: { size: number, ratio: number } | querystring.ParsedUrlQuery) {

            return ""
        }
    }
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
        opus = "audio/opus"
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

    const app = express() //本体
    app.listen(80, async () => console.log("サーバーが立ち上がりました。"))

    app.get("*", async (req, res) => {
        const url = req.url.split("/") //階層の配列にします。(？)
        let paramString = url[url.length - 1].split("?")
        let param: querystring.ParsedUrlQuery | null
        if (paramString[1]) {
            url[url.length - 1] = paramString[0]
            param = querystring.parse(paramString[1])
        }
        const settings: settings = {
            headers: {},
            statusCode: 500,
            pass: ""
        }
        if (!url[url.length - 1]) url[url.length - 1] = "index.html"
        if (url[1] === "sources") {
            for (let i: number = 1; i != url.length; i++) {
                settings.pass += url[i]
                if (i !== (url.length - 1)) settings.pass += "/"
            }
            settings.statusCode = 200
        } else if (url[1] === "serverdata") {
            settings.pass += savePass
            for (let i: number = 2; i != url.length; i++) {
                settings.pass += url[i]
                if (i !== (url.length - 1)) settings.pass += "/"
            }
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

//下のやつを使って、ytdl全般の処理をする
const cache = new youtube.CachePass()
