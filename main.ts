import express from "express"
import fs, { stat } from "fs"
import ytdl from "ytdl-core"
import ytch from "yt-channel-info"
import querystring from "querystring"

//本体
const app = express()
app.listen(80, async () => console.log("サーバーが立ち上がりました。"))

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

interface data {
    ytdlRawInfoData: {
        [videoId: string]: ytdl.VideoDetails
    },
    ytchRawInfoData: {
        [authorId: string]: ytchInterface.ChannelInfo
    },
    ytIndex: {
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
interface processJson {
    Apps: {
        name: string,

    }[]
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
    const ytdata: {
        ytdlRawInfoData: {
            [videoId: string]: ytdl.VideoDetails
        },
        ytchRawInfoData: {
            [authorId: string]: ytchInterface.ChannelInfo
        },
        ytIndex: {
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
    } = {
        ytdlRawInfoData: {},
        ytchRawInfoData: {},
        ytIndex: {
            videoIds: {},
            authorIds: {}
        }
    }
    export class CachePass {
        constructor(
            ytdlRawInfoData: {
                [videoId: string]: ytdl.VideoDetails
            },
            ytchRawInfoData: {
                [authorId: string]: ytchInterface.ChannelInfo
            },
            ytIndex: {
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
        ) {
            ytdata.ytdlRawInfoData = ytdlRawInfoData
            ytdata.ytchRawInfoData = ytchRawInfoData
            ytdata.ytIndex = ytIndex
        }
        getAuthorImage(authorId: string, param: { size: number, ratio: number } | querystring.ParsedUrlQuery) {

            return ""
        }
    }
}
//データ読み込み
const data: data = JSON.parse(String(fs.readFileSync("data.json")))
const processJson: processJson = JSON.parse(String(fs.readFileSync("processJson.json")))
const savePass: string = JSON.parse(String(fs.readFileSync("dataPass.json"))).default

//下のやつを使って、ytdl全般の処理をする
//僕の推測では、これらすべては参照渡しのはずです。
const cache = new youtube.CachePass(data.ytdlRawInfoData, data.ytchRawInfoData, data.ytIndex)

app.get("*", async (req, res) => {
    const url = req.url.split("/") //階層の配列にします。(？)
    let paramString = url[url.length - 1].split("?")
    let param: querystring.ParsedUrlQuery
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
    if (url[1] == "sources") {
        for (let i: number = 1; i != url.length; i++) {
            settings.pass += url[i]
            if (i != (url.length - 1)) settings.pass += "/"
        }
        const extension = url[url.length - 1].split(".")[1]
        switch (extension) {
            case "html": {
                settings.headers["Content-Type"] = contentType.html
                break
            }
            default: {
                settings.headers["Content-Type"] = contentType.plain
                break
            }
        }
        if (url[url.length - 1] == "watch") {
            settings.pass = "sources/ytdl/playwith/index.html"
            settings.headers["Content-Type"] = contentType.html
            console.log("watchcc")
        }
        settings.statusCode = 200
    } else if (url[1] == "ytimage") {
        const videoId = url[url.length - 1]
        settings.pass = savePass + "cache/YouTubeThumbnail/" + videoId + ".jpg"
        if (param)
            if (param.ratio && param.size)
                settings.pass = savePass + "cache/YouTubeThumbnailRatioResize/" + videoId + "-r" + param.ratio + "-" + param.size + ".jpg"
        settings.statusCode = 200
        settings.headers["Content-Type"] = contentType.jpeg
    } else if (url[1] == "ytauthorimage") {
        const authorId = url[url.length - 1]
        settings.pass = cache.getAuthorImage(authorId, param)
        settings.statusCode = 200
        settings.headers["Content-Type"] = contentType.jpeg
    }
    if (!fs.existsSync(settings.pass)) settings.statusCode = 400
    if (settings.statusCode != 400) {
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
    const url = req.url.split("/")
    const settings: settings = {
        headers: {},
        statusCode: 500,
        pass: "",
        resData: ""
    }
    settings.headers["Content-Type"] = contentType.plain
    if (url[1] == "applcation-info") {
        settings.statusCode = 200
        settings.resData = JSON.stringify(processJson.Apps)
    }
    else if (url[1] == "ytdlRawInfoArray") {
        settings.statusCode = 200
        settings.resData = JSON.stringify(Object.keys(data.ytdlRawInfoData))
    } else if (url[1] == "ytindex-list") {
        settings.statusCode = 200
        settings.resData = JSON.stringify(data.ytIndex.videoIds)
    }
    console.log("Post " + settings.statusCode + ": " + req.url)
    res.writeHead(settings.statusCode, settings.headers)
    res.end(settings.resData)
})
