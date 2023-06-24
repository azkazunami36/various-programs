import express from "express"

import { discordRealTimeData } from "./discord-bot"

/**
 * expressdは名前の通りexpressを利用しますが、少し変わった点があります。  
 * それは、cuiIOの上位互換だと言うことです。
 * 
 * つまり、cuiIOでのプログラムにアクセスする手段のGUI版と言うことです。
 * そのため、今後cuiIOとguiIOのプログラム内容の同期を行うための、新しい方法を試行錯誤しておきます。
 * が、それまではプログラムは全く別になり、同じ操作方法を保証することはないです。
 */
export class expressd {
    constructor() { }
    /**
     * 未完成のため、ここの関数で実行されます。
     * もしここの関数のみで完成した場合、classを削除しfunctionに置き換えます。
     * ※sourcedフォルダにデータを入れていますが、main.jsのプログラムを全てここに入れ終えたら、sourcesに名前を変更します。
     */
    static async main(shareData: {
        discordBot?: {
            [botName: string]: discordRealTimeData
        }
    }): Promise<void> {
        const app = express()
        app.get("*", async (req, res) => {
            /**
             * リクエスト(要求)された場所
             */
            const url = req.url
            /**
             * 応答の種類です。
             * sourcesフォルダにアクセスするか、その他のデータにアクセスするかを確認し、それに合ったプログラムを実行します。
             * pass内に「/」で分割し、それを利用してファイル先へアクセスする手がかりにします。
             * 戻り値にファイルパスを入れる必要があります。
             */
            const type: { [type: string]: (pass: string[]) => Promise<string> } = {
                "sources": async pass => {
                    return ""
                }
            }
            const passArray = url.split("/")
            const passdata = await type[passArray[1]]([...passArray])
        })
    }
}
export default expressd