import EventEmitter from "events"
import ytdl from "ytdl-core"
import fs from "fs"
import ffmpeg from "fluent-ffmpeg"

import dataIO from "./dataIO"
interface youtubeDownloaderEvents {
    ready: [void]
    error: [Error]
}
interface sourceMetadata {
    /**
     * 取得元を書きます。
     * YouTube Downloaderからの場合、ytdlと書かれ重複ダウンロードを回避します。
     * User追加は`Apple Music` `Spotify` `Original Author` となります。
     */
    source: "ytdl" | "Apple Music" | "Spotify" | "Original Author"
    /**
     * YouTubeのオリジナル動画であるかを決定します。
     * FFmpeg等で変換した場合はFalse、ytdlでダイレクト入手したデータのみがTrueになります。
     */
    original: boolean
    /**
     * オリジナルが存在しない場合、Trueにすることができます。
     * オリジナルが入手できた場合は自動でFalseに設定されます。
     */
    userOriginal: boolean
    /**
     * コーデックです。動画も音声も画像も入っている可能性があります。
     */
    codec: string
    /**
     * FPSです。音声などの場合はnullになります。
     */
    fps: number | null
    /**
     * 縦の高さです。音声などの場合はnullになります。
     */
    height: number | null
    /**
     * 音声のビット深度です。動画などの場合はnullになります。
     */
    bits: number | null
    /**
     * サンプルレートです。動画などの場合はnullになります。
     */
    samplelate: number | null
    /**
     * オリジナルとのズレを数字で記録します。
     * １秒過ぎている場合は1000、１秒送れている場合は-1000です。
     */
    latency: number
    /**
     * オリジナルデータに近いか同じ場合はTrueです。
     * そうでない場合はFalseです。音楽などのデータを記録する際、YouTubeにエンディング音声が含まれている場合はFalseとする場合が多いです。
     */
    sameAsOriginal: boolean
    /**
     * 曲のアルバムアートワークである場合はアルバム名をセットします。自動で関連付けられます。
     * 画像以外の場合は意味を成しませんので、nullになるようにしてください。バグが起こることはありません。
     */
    albumArtwork: string | null
}
interface videoMetadata {
    /**
     * VideoIDに関連付けられたYouTubeでのタイトルです。
     */
    title: string
    /**
     * YouTubeでの説明です。
     */
    description: string
    /**
     * ytdl管理のユーザー情報を丸ごと格納しています。
     */
    author: ytdl.Author
    /**
     * カテゴリ名を格納しています
     */
    category: string
    /**
     * YouTubeサムネイル画像のURLを格納しています。
     */
    thumbnailURL: string
    /**
     * ytdlで入手したデータのそのままの情報を入れています。不足した際にはここから利用します。
     */
    ytdlRawData: ytdl.MoreVideoDetails
    /**
     * 様々な品質や種類のデータが入っています。
     */
    datas: sourceMetadata[]
    /**
     * ミュージックソフトでアルバムを作成するための情報です。
     * アルバム名はdatasに入っている画像と照合し、一致するものを使用されます。
     */
    mp3Tag?: {
        /**
         * 曲名を入力します。
         */
        title: string
        /**
         * 曲名の読みを入力します
         */
        readTitle: string
        /**
         * アーティスト名を入力します。
         */
        artist: string
        /**
         * アーティスト名の読みを入力します。
         */
        readArtist: string
        /**
         * アルバム名を入力します。
         */
        albumTitle: string
        /**
         * アルバム名の読みを入力します。
         */
        readAlbumTitle: string
        /**
         * アルバムの作成者を入力します。
         */
        albumArtist: string
        /**
         * アルバムの作成者の読みを入力します。
         */
        readAlbumArtist: string
        /**
         * 作曲者名を入力します。
         */
        composer: string
        /**
         * 作曲者名の読みを入力します。
         */
        readComposer: string
        /**
         * トラック番号を入力します。
         */
        trackNo: number
        /**
         * トータルのトラック数を入力します。
         */
        totalTrackNo: number
        /**
         * ディスク番号を入力します
         */
        diskNo: number
        /**
         * トータルのディスク数を入力します。
         */
        totalDiskNo: number
        /**
         * 作成した年を入力します。
         */
        year: number
        /**
         * BPMを入力します。
         */
        bpm: number
        /**
         * ジャンルを入力します。
         */
        genre: string
        /**
         * コピーライトを入力します。
         */
        copyright: string
    }
}
/**
 * ytdlで使用するJSONの型です。
 */
interface ytdldataIOextJSON extends dataIO {
    /**
     * YouTube Downloaderにまつわるデータを全て格納します。
     */
    json: {
        /**
         * 進行状況をJSONに書き込んでいます。完了した場合はdownloadedとなり、利用できる可能性が上がっています。
         * 進行中に中断された場合、検知し削除されるようにしています。
         */
        progress?: {
            [videoId: string]: {
                /**
                 * ダウンロード中かダウンロードが終わっているか
                 */
                status: "download" | "downloaded",
                /**
                 * ダウンロード開始時間
                 */
                startTime: number,
                /**
                 * ダウンロード速度？チャンクの長さ
                 */
                chunkLength: number,
                /**
                 * ダウンロード済み
                 */
                downloaded: number,
                /**
                 * ダウンロード終了
                 */
                total: number
            }
        },
        /**
         * 登録されているVideoIDの一覧です。
         */
        videoMeta?: {
            [videoId: string]: videoMetadata
        }
    }
}
export declare interface youtubeDownloader {
    on<K extends keyof youtubeDownloaderEvents>(s: K, listener: (...args: youtubeDownloaderEvents[K]) => any): this
    emit<K extends keyof youtubeDownloaderEvents>(eventName: K, ...args: youtubeDownloaderEvents[K]): boolean
}
/**
 * YouTube Downloaderメインクラスです。
 */
export class youtubeDownloader extends EventEmitter {
    data: ytdldataIOextJSON
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
            return
        }
        this.data = data
    }
    /**
     * クラスを安定して初期化します。
     * @returns クラスを返します。
     */
    static async initer() {
        return await new Promise<youtubeDownloader>(resolve => {
            const youtubedl = new youtubeDownloader()
            youtubedl.on("ready", () => resolve(youtubedl))
        })
    }
    /**
     * YouTubeからソースを入手します。
     * @param videoId VideoIDを入力します。
     * @param type 動画を入手するか音声を入手するかを決めます。
     * @returns 
     */
    async videoDataGet(videoId: string, type: "videoonly" | "audioonly") {
        if (!this.data) return // dataIOが初期化されていない場合リターン
        const youtubedl = ytdl(videoId, { filter: type, quality: "highest" }) //ytdlに指定
        const pass = await this.data.passGet(["youtubeSource", "temp", videoId], type) // 保存パスを指定
        if (!pass) return // パスが存在しない場合リターン
        const Stream = fs.createWriteStream(pass) // パス先に書き込みストリームを作成
        youtubedl.pipe(Stream) // ダウンロードを開始
        youtubedl.on("progress", (chunkLength, downloaded, total) => { //進行状況を作成
            if (!this.data) return
            if (!this.data.json.progress) this.data.json.progress = {}
            const progress = this.data.json.progress[videoId]
            progress.chunkLength = chunkLength
            progress.downloaded = downloaded
            progress.total = total
            progress.status = "download"
            progress.startTime = progress.startTime ? progress.startTime : Date.now() // 書き込まれていない場合のみ現在時刻を入れ、開始時間とする。
        })
        youtubedl.on("end", async () => { //操作が完了すると
            if (!this.data) return // dataIOが初期化されていない場合リターン
            if (!this.data.json.progress) this.data.json.progress = {} // 進行状況が空の場合作成
            this.data.json.progress[videoId].status = "downloaded" // ダウンロード済みとする
            async function ffprobe(pass: string): Promise<ffmpeg.FfprobeData> { // FFprobeの関数
                return await new Promise(resolve => {
                    ffmpeg(pass).ffprobe((err, data) => { resolve(data) })
                })
            }
            const data = await ffprobe(pass) // FFprobeで情報を入手
            const video = data.streams[0]
            const fps = (() => { // もしfps値が「0」または「0/0」だった場合に自動で計算する関数
                if (!video.r_frame_rate) return null
                if (video.r_frame_rate.match("/")) {
                    const data = video.r_frame_rate.split("/")
                    return Number(data[0]) / Number(data[1])
                } else return Number(video.r_frame_rate)
            })()
            if (!this.data.json.videoMeta) this.data.json.videoMeta = {}
            const getIs = await this.getInfo(videoId)
            this.data.json.videoMeta[videoId].datas
        })
    }
    /**
     * YouTubeにある動画の情報を入手します。
     * @param videoId VideoIDを入力します。
     * @return 操作が完了したかどうかを返します。
     */
    async getInfo(videoId: string) {
        try {
            const { videoDetails } = await ytdl.getInfo(videoId) // データを取得
            if (!this.data.json.videoMeta) this.data.json.videoMeta = {} // 存在しない場合初期化
            this.data.json.videoMeta[videoId] = { // データのセット 履歴作成には対応していないため、後々変更する必要がある
                title: videoDetails.title,
                description: videoDetails.description ? videoDetails.description : "",
                author: videoDetails.author,
                category: videoDetails.category,
                thumbnailURL: await (async () => {
                    let largeImageArray: number = 0
                    let largeImageHeight: number = 0
                    for (let i = 0; i !== videoDetails.thumbnails.length; i++) {
                        const thumbnail = videoDetails.thumbnails[i]
                        if (largeImageHeight < thumbnail.height) {
                            largeImageArray = i
                            largeImageHeight = thumbnail.height
                        }
                    }
                    return videoDetails.thumbnails[largeImageArray].url
                })(),
                ytdlRawData: videoDetails,
                datas: []
            }
            return true
        } catch (e) {
            return false
        }
    }
}
export default youtubeDownloader
