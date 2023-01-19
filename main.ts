import express from "express"
import fs, { stat } from "fs"
import ytdl from "ytdl-core"
import ytch from "yt-channel-info"
import querystring from "querystring"

//本体
const app = express()
app.listen(80, async () => console.log("サーバーが立ち上がりました。"))

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
        "Content-Length"?: string
    },
    /**
     * ステータスコードです。
     */
    statusCode: 200 | 204 | 400 | 404 | 500,
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
interface ChannelInfo {
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

interface data {
    ytdlRawInfoData: {
        [videoId: string]: ytdl.VideoDetails
    },
    ytchRawInfoData: {
        [authorId: string]: ChannelInfo
    },
    ytIndex: {
        videoIds: string[]
    }
}
interface processJson {
    Apps: {
        name: string,

    }[]
}

//データ読み込み
const data: data = JSON.parse(String(fs.readFileSync("data.json")))
const processJson: processJson = JSON.parse(String(fs.readFileSync("processJson.json")))
const savePass: string = JSON.parse(String(fs.readFileSync("dataPass.json"))).default

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
        settings.pass = savePass + "cache/YouTubeAuthorIcon/" + authorId + ".jpg"
        if (param)
            if (param.ratio && param.size)
                settings.pass = savePass + "cache/YouTubeAuthorIconRatioResize/" + authorId + "-r" + param.ratio + "-" + param.size + ".jpg"
        settings.statusCode = 200
        settings.headers["Content-Type"] = contentType.jpeg
    }
    if (!fs.existsSync(settings.pass)) settings.statusCode = 400
    res.writeHead(settings.statusCode, settings.headers)
    if (settings.statusCode != 400) {
        const length = fs.statSync(settings.pass).size
        settings.headers["Content-Length"] = String(length)
        if (req.headers.range) {
            const ranges = String(req.headers.range).split("-")
            if (ranges[0]) ranges[0] = ranges[0].replace(/\D/g, "")
            if (ranges[1]) ranges[1] = ranges[1].replace(/\D/g, "")

        }
        const Stream = fs.createReadStream(settings.pass)
        Stream.on("data", chunk => res.write(chunk))
        Stream.on("end", () => res.end())
        Stream.on("error", e => {
            settings.statusCode = 500
            res.sendStatus(settings.statusCode)
        })
    } else res.end()
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
