import { discordRealTimeData } from "./discord-bot.js"
import expressd from "./expressd.js"
import youTubeDownloader from "./youtubeDownloader.js"
import handyTool from "./handyTool.js"
import dataIO from "./dataIO.js"
import cuiIO from "./cuiIO2.js"
import ffmpegConverter from "./ffmpegConverter.js"

/**
 * Various Programsを動かす上で共通で利用されるインターフェイスや関数をまとめています。
 * 主にcuiIO、expressdが利用するものです。
 */
export namespace vpManageClass {
    /**
     * 常駐プログラムなどの関数やクラス、データなどを保存する場所です。
     */
    export interface shareData {
        discordBot?: {
            [botName: string]: discordRealTimeData
        }
        expressd?: expressd.expressd
        cuiIO?: cuiIO.cuiIO
        youtubedl?: youTubeDownloader.youTubeDownloader
        dataIO?: dataIO.ny
        ffmpegConverter?: ffmpegConverter
    }
    export class ShareData {
        shareData: {
            discordBot?: {
                [botName: string]: discordRealTimeData
            }
            expressd?: expressd.expressd
            cuiIO?: cuiIO.cuiIO
            youtubedl?: youTubeDownloader.youTubeDownloader
            dataIO?: dataIO.ny
            ffmpegConverter?: ffmpegConverter
        } = {}
        get expressd(): expressd.expressd {
            if (!this.shareData.expressd) this.shareData.expressd = new expressd.expressd()
            return this.shareData.expressd
        }
        get cuiIO(): cuiIO.cuiIO {
            if (!this.shareData.cuiIO) this.shareData.cuiIO = new cuiIO.cuiIO(this)
            return this.shareData.cuiIO
        }
        get youtubedl(): youTubeDownloader.youTubeDownloader {
            if (!this.shareData.youtubedl) this.shareData.youtubedl = new youTubeDownloader.youTubeDownloader()
            return this.shareData.youtubedl
        }
        get dataIO(): dataIO.ny {
            if (!this.shareData.dataIO) this.shareData.dataIO = new dataIO.ny()
            return this.shareData.dataIO
        }
        get ffmpegConverter(): ffmpegConverter {
            if (!this.shareData.ffmpegConverter) this.shareData.ffmpegConverter = new ffmpegConverter()
            return this.shareData.ffmpegConverter
        }
    };
    /**
     * Various Programsの常駐プログラムをすべて終了します。
     * 一括で終了し、必要に応じて保存処理なども行うため、シャットダウンと呼べます。
     * @param shareData shareDataを入力してください。常駐プログラムにアクセスする上で欠かせません。
     * @param option オプションを設定します。
     */
    export async function shutdown(ShareData: ShareData, option: {
        /**
         * 進行状況を表示します。
         * @param status どのような処理をしているかの状態を表しています。
         * @returns 
         */
        message?: (status: {
            /**
             * どの処理をこなっているかを確認できます
             */
            type: "discordBotExit" | "expressdExit" | "wait" | "exited",
            /**
             * 処理段階を確認できます。
             */
            status: "start" | "working" | "end",
            /**
             * 場合によってはデータを提供します。主にステータスが"working"になっている際に利用可能です。
             */
            string?: string
        }) => void,
        /**
         * シャットダウン処理をする際に、強制終了をするかどうかを設定します。
         * デフォルトはfalseです。強制的ではないため、フリーズを招いた場合はバグです。
         */
        forced?: boolean
    }) {
        const message = (() => {
            if (option.message) return option.message
            else return () => {}
        })()
        if (ShareData.shareData.discordBot) {
            message({ type: "discordBotExit", status: "start" })
            const botNames = Object.keys(ShareData.shareData.discordBot)
            for (let i = 0; i !== botNames.length; i++) {
                message({ type: "discordBotExit", status: "working", string: botNames[i] })
                const bot = ShareData.shareData.discordBot[botNames[i]]
                if (bot.status && bot.status.logined && bot.client) bot.client.destroy()
            }
            message({ type: "discordBotExit", status: "end" })
        }
        if (ShareData.shareData.expressd) {
            message({ type: "expressdExit", status: "start" })
            if (ShareData.shareData.expressd.server) {
                ShareData.shareData.expressd.server.close()
            }
            if (ShareData.shareData.expressd.redirectServer) {
                ShareData.shareData.expressd.redirectServer.close()
            }
            message({ type: "expressdExit", status: "end" })
        }
        message({type: "exited", status: "start"})
        if (option.forced) {
            message({type: "wait", status: "start"})
            await handyTool.wait(5000)
            message({type: "wait", status: "end"})
            process.exit(1)
        } else {
            message({type: "exited", status: "end"})
        }
    }
}
export default vpManageClass
