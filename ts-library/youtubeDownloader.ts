import EventEmitter from "events"
import ytdl from "ytdl-core"
import fs from "fs"
import ffmpeg from "fluent-ffmpeg"

import dataIO from "./dataIO"
interface youtubeDownloaderEvents {
    ready: [void]
    error: [Error]
}
interface ytdldataIOextJSON extends dataIO {
    json: {
        progress?: {
            [videoId: string]: {
                status: "download" | "downloaded",
                startTime: number,
                chunkLength: number,
                downloaded: number,
                total: number
            }
        },
        videoMeta?: {
            [videoId: string]: {
                [codec: string]: {
                    [height: number]: {
                        [fps: number]: {}
                    }
                }
            }
        },
        codecType?: {
            [codecName: string]: boolean
        }
    }
}
export declare interface youtubeDownloader {
    on<K extends keyof youtubeDownloaderEvents>(s: K, listener: (...args: youtubeDownloaderEvents[K]) => any): this
    emit<K extends keyof youtubeDownloaderEvents>(eventName: K, ...args: youtubeDownloaderEvents[K]): boolean
}
export class youtubeDownloader extends EventEmitter {
    data: ytdldataIOextJSON | undefined
    constructor() {
        super()
        this.pconst().then(() => this.emit("ready", undefined))
    }
    private async pconst() {
        const data = await dataIO.initer("youtube-downloader")
        if (!data) {
            const e = new ReferenceError()
            e.message = "dataIOの準備ができませんでした。"
            e.name = "YouTube Downloader"
            this.emit("error", e)
        }
    }
    async videoDataGet(videoId: string, type: "videoonly" | "audioonly") {
        if (!this.data) return
        const youtubedl = ytdl(videoId, { filter: type, quality: "highest" })
        const pass = await this.data.passGet(["youtubeSource", "temp", videoId], type)
        if (!pass) return
        const Stream = fs.createWriteStream(pass)
        youtubedl.pipe(Stream)
        youtubedl.on("progress", (chunkLength, downloaded, total) => {
            if (!this.data) return
            if (!this.data.json.progress) this.data.json.progress = {}
            const progress = this.data.json.progress[videoId]
            progress.chunkLength = chunkLength
            progress.downloaded = downloaded
            progress.total = total
            progress.status = "download"
            progress.startTime = progress.startTime ? progress.startTime : Date.now()
        })
        youtubedl.on("end", async () => {
            if (!this.data) return
            if (!this.data.json.progress) this.data.json.progress = {}
            this.data.json.progress[videoId].status = "downloaded"
            async function ffprobe(pass: string): Promise<ffmpeg.FfprobeData> {
                return await new Promise(resolve => {
                    ffmpeg(pass).ffprobe((err, data) => { resolve(data) })
                })
            }
            const data = await ffprobe(pass)
            const video = data.streams[0]
            const fps = (() => {
                if (!video.r_frame_rate) return null
                if (video.r_frame_rate.match("/")) { //もしfps値が「0」または「0/0」だった場合に自動で計算する関数
                    const data = video.r_frame_rate.split("/")
                    return Number(data[0]) / Number(data[1])
                } else return Number(video.r_frame_rate)
            })()
            if (!this.data.json.videoMeta) this.data.json.videoMeta = {}
            if (!video.codec_name) return
            if (!video.height) return
            if (!fps) return
            Object.assign(this.data.json.videoMeta, {
                [videoId]: {
                    [video.codec_name]: {
                        [video.height]: {
                            [fps]: {}
                        }
                    }
                }
            })
            //これしか重複せず高速で、プログラムが入手したコーデック一覧を作る方法がわからない
            if (!this.data.json.codecType) this.data.json.codecType = {}
            this.data.json.codecType[video.codec_name] = true
        })
    }
}
export default youtubeDownloader