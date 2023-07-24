import EventEmitter from "events"
import ytdl from "ytdl-core"
import fs from "fs"
import ffmpeg from "fluent-ffmpeg"

import dataIO from "./dataIO"
import vpManageClass from "./vpManageClass"
import musicManager from "./musicManager"
interface youtubeDownloaderEvents {
    ready: [void]
    error: [Error]
}
/**
 * 保存するソースのデータのガイドです。保存されると思われるデータは主に動画、音声、画像です。  
 * それ以外のファイルが保存された場合、除外するためのコードを追加します。
 */
export interface sourceMetadata {
    /**
     * 保存された場所を入力します。dataIOでpassGetをする際に利用しているデータを入力してください。
     * ユーザーが操作を加えないようにしてください。基本的にこのデータを変更すると例外が起こることがあります。
     */
    path: {
        /**
         * フォルダパスです。
         */
        path: string[]
        /**
         * ファイル名です。
         */
        name: string
    }
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
     * まだ未検証ですが、fltpという深度表示になった場合は深度表示を利用できないことがあります。
     */
    bits: string | null
    /**
     * サンプルレートです。動画などの場合はnullになります。
     */
    samplerate: number | null
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
export interface videoMetadata {
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
     * このメタデータの作成時間をDate.now()で入力してください。履歴の作成に使用されます。
     */
    setTime: number
    /**
     * 様々な品質や種類のデータが入っています。
     * noには番号を入力しますが、管理方法はytdlのクラスに任せてください。勝手に操作をするとデータを失う恐れがあり、番号を変更しないでください。
     */
    datas: { [no: string]: sourceMetadata }
    /**
     * 過去のデータ(変更前のもの)を履歴として保存します。  
     * RAWデータの保存は行いません。アップデートで必要になった際、一斉にデータの要求が増すため、全体のデータアップデートの際に履歴が作成される恐れがありますが、問題はありません。  
     * ですが、履歴として保存するというトリガが引かれた際には必ず上書きを行います。
     */
    history: {
        /**
         * msでの入力を行います。Number型からString型に変換しましょう。
         * 時間ごとに追跡する場合、大なり小なりで計算を行ってください。
         */
        [time: string]: {
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
        }
    }
    /**
     * ミュージックソフトでアルバムを作成するための情報です。  
     * アルバム名はdatasに入っている画像と照合し、一致するものを使用されます。
     */
    mp3Tag?: musicManager.mp3Tag
}
/**
 * ytdlで使用するJSONの型です。
 */
interface ytdldataIOextJSON extends dataIO.dataIO {
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
 * YouTube Downloaderメインクラスです。shareDataで利用を推奨しています。
 * ディスク領域を豪快に使う設計なため、予め大容量のドライブに空き容量を作った状態で利用してください。
 * 今後データ管理機能が完成し、容量の参照が出来たり節約ができる設計が完成した際には、改善が試みられる予定です。
 */
export class youtubeDownloader extends EventEmitter {
    data: ytdldataIOextJSON
    constructor() {
        super()
        this.pconst().then(() => this.emit("ready", undefined))
    }
    private async pconst() {
        const data = await dataIO.dataIO.initer("youtube-downloader")
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
     * YouTube Downloaderの準備を行います。
     */
    static async initer(shareData: vpManageClass.shareData) {
        shareData.youtubedl = await new Promise<youtubeDownloader>(resolve => {
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
    async playSourceGet(videoId: string, type: "videoonly" | "audioonly") {
        if (!this.data) {
            const e = new ReferenceError()
            e.message = "dataIOの準備ができませんでした。"
            e.name = "YouTube Downloader"
            this.emit("error", e)
            return
        } // dataIOが初期化されていない場合リターン
        const youtubedl = ytdl(videoId, { filter: type, quality: "highest" }) //ytdlに指定
        const pass = await this.data.passGet(["youtubeSource", "temp", videoId], type) // 保存パスを指定
        if (!pass) { // パスが存在しない場合リターン
            const error = new ReferenceError()
            error.message = "dataIOの疑似パスの取得に失敗しました。"
            error.name = "YouTube Downloader"
            this.emit("error", error)
            return
        }
        const Stream = fs.createWriteStream(pass) // パス先に書き込みストリームを作成
        youtubedl.pipe(Stream) // ダウンロードを開始
        youtubedl.on("progress", (chunkLength, downloaded, total) => { //進行状況を作成・保存
            if (!this.data) {
                const e = new ReferenceError()
                e.message = "dataIOの準備ができませんでした。"
                e.name = "YouTube Downloader"
                this.emit("error", e)
                return
            }
            if (!this.data.json.progress) this.data.json.progress = {}
            const progress = this.data.json.progress[videoId]
            progress.chunkLength = chunkLength
            progress.downloaded = downloaded
            progress.total = total
            progress.status = "download"
            progress.startTime = progress.startTime ? progress.startTime : Date.now() // 書き込まれていない場合のみ現在時刻を入れ、開始時間とする。
        })
        youtubedl.on("end", async () => { //操作が完了すると
            if (!this.data) { // dataIOが初期化されていない場合リターン
                const e = new ReferenceError()
                e.message = "dataIOの準備ができませんでした。"
                e.name = "YouTube Downloader"
                this.emit("error", e)
                return
            }
            if (!this.data.json.progress) this.data.json.progress = {} // 進行状況が空の場合作成
            this.data.json.progress[videoId].status = "downloaded" // ダウンロード済みとする
            async function ffprobe(pass: string): Promise<ffmpeg.FfprobeData> { // FFprobeの関数
                return await new Promise(resolve => {
                    ffmpeg(pass).ffprobe((err, data) => { resolve(data) })
                })
            }
            const data = await ffprobe(pass) // FFprobeで情報を入手
            const video = data.streams[0]
            if (!this.data.json.videoMeta) this.data.json.videoMeta = {}
            const getIs = await this.getInfo(videoId) // VideoIDのデータを取得し初期化
            if (!getIs) {
                const error = new ReferenceError()
                error.message = "YouTubeから情報を取得できませんでした。"
                error.name = "YouTube Downloader"
                this.emit("error", error)
                return
            }
            if (!video.codec_name) { // コーデック名が不明だと後々面倒なのでエラー
                const error = new ReferenceError()
                error.message = "コーデックが確認できませんでした。"
                error.name = "YouTube Downloader"
                this.emit("error", error)
                return
            }
            const no = (() => { // VideoIDのJSON内にあるソースデータJSONに空きのある番号を確認する
                let i = 0
                while (true) {
                    if (!this.data.json.videoMeta[videoId].datas[String(i)]) return String(i)
                    else i++
                }
            })()
            const path = await this.data.passGet(["youtubeSource", "sources", videoId], no)
            if (!path) {
                const error = new ReferenceError()
                error.message = "dataIOの疑似パスの取得に失敗しました。"
                error.name = "YouTube Downloader"
                this.emit("error", error)
                return
            }
            const Stream = fs.createReadStream(pass) // 読み込みストリーム
            Stream.pipe(fs.createWriteStream(path)) // 書き込みストリームを使い書き込む
            Stream.on("end", () => {})
            this.data.json.videoMeta[videoId].datas[no] = {
                path: {
                    path: ["youtubeSource", "sources", videoId],
                    name: no
                },
                source: "ytdl",
                original: true,
                userOriginal: false,
                codec: video.codec_name,
                fps: (() => { // もしfps値が「0」または「0/0」だった場合に自動で計算する関数
                    if (!video.r_frame_rate) return null
                    if (video.r_frame_rate.match("/")) {
                        const data = video.r_frame_rate.split("/")
                        return Number(data[0]) / Number(data[1])
                    } else return Number(video.r_frame_rate)
                })(),
                height: video.height ? video.height : null,
                bits: video.sample_fmt ? video.sample_fmt : null,
                samplerate: video.sample_rate ? video.sample_rate : null,
                latency: 0,
                sameAsOriginal: true,
                albumArtwork: null
            }
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
            const thumbnailURLGet = (videoDetails: ytdl.MoreVideoDetails) => { // 最も大きいサムネイルを探し、URLを返す
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
            }
            if (!this.data.json.videoMeta[videoId]) this.data.json.videoMeta[videoId] = { // 初期化データのセット
                title: videoDetails.title,
                description: videoDetails.description ? videoDetails.description : "",
                author: videoDetails.author,
                category: videoDetails.category,
                setTime: Date.now(),
                thumbnailURL: thumbnailURLGet(videoDetails),
                ytdlRawData: videoDetails,
                datas: {},
                history: {}
            }
            const data = this.data.json.videoMeta[videoId]
            if ((() => {
                if (data.title !== videoDetails.title) return true
                if (data.description !== videoDetails.description ? videoDetails.description : "") return true
                if (data.author !== videoDetails.author) return true
                if (data.category !== videoDetails.category) return true
                if (data.thumbnailURL !== thumbnailURLGet(videoDetails)) return true
            })()) {
                data.history[String(data.setTime)] = {
                    title: data.title,
                    description: data.description,
                    author: data.author,
                    category: data.category,
                    thumbnailURL: data.thumbnailURL
                }
                data.title = videoDetails.title
                data.description = videoDetails.description ? videoDetails.description : ""
                data.author = videoDetails.author
                data.category = videoDetails.category
                data.thumbnailURL = thumbnailURLGet(videoDetails)
                data.setTime = Date.now()
                data.ytdlRawData = videoDetails
            }
            return true
        } catch (e) {
            return false
        }
    }
}
export default youtubeDownloader
