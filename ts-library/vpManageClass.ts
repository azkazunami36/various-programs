import { discordRealTimeData } from "./discord-bot.js"
import expressd from "./expressd.js"
import youTubeDownloader from "./youtubeDownloader.js"
import handyTool from "./handyTool.js"
import dataIO from "./dataIO.js"
import cuiIO from "./cuiIO.js"
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
        cuiIO?: cuiIO
        youtubedl?: youTubeDownloader.youTubeDownloader
        dataIO?: dataIO.ny
        ffmpegConverter?: ffmpegConverter
    }
    /**
     * Various Programsの常駐プログラムをすべて終了します。
     * 一括で終了し、必要に応じて保存処理なども行うため、シャットダウンと呼べます。
     * @param shareData shareDataを入力してください。常駐プログラムにアクセスする上で欠かせません。
     * @param option オプションを設定します。
     */
    export async function shutdown(shareData: shareData, option: {
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
        if (shareData.discordBot) {
            message({ type: "discordBotExit", status: "start" })
            const botNames = Object.keys(shareData.discordBot)
            for (let i = 0; i !== botNames.length; i++) {
                message({ type: "discordBotExit", status: "working", string: botNames[i] })
                const bot = shareData.discordBot[botNames[i]]
                if (bot.status && bot.status.logined && bot.client) bot.client.destroy()
            }
            message({ type: "discordBotExit", status: "end" })
        }
        if (shareData.expressd) {
            message({ type: "expressdExit", status: "start" })
            if (shareData.expressd.server) {
                shareData.expressd.server.close()
            }
            if (shareData.expressd.redirectServer) {
                shareData.expressd.redirectServer.close()
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
            if (shareData.cuiIO && shareData.cuiIO.funcSelect) shareData.cuiIO.funcSelect.end = true
            message({type: "exited", status: "end"})
        }
    }
}
export default vpManageClass
