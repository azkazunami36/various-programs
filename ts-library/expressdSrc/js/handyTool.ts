import { mouseCursor } from "./mouseCursor"
import { windowSystem } from "./windowSystem"

/**
 * httpリクエストできる関数
 * @param request URLに含ませるリクエスト(処理分岐)を入力
 * @param send 送信したいテキスト(JSONもstringifyで可能)
 * @returns 
 */
export async function httpDataRequest(request: string, send: string) {
    return await new Promise<string>(resolve => {
        const req = new XMLHttpRequest()
        req.open("POST", "http://" + location.hostname + ":" + location.port + "/" + request)
        req.setRequestHeader("content-type", "text/plain;charset=UTF-8")
        req.send(send); //データを送信
        req.onreadystatechange = async () => { if (req.readyState === 4 && req.status === 200) resolve(req.responseText) } //レスポンスを返す
    })
}

/**
 * Various Programsのメインプロセスと通信するためのAPIです。  
 * 状況を受け取ったり、作業を指示したりすることが出来ます。
 * ```
 *  "メインネーム(プログラム名などを入力)": {
        "名前を入力する(機能などを入力する。メインネームだけで済む場合はmainなどの名前を使用する。)": async () => { // 例１です。簡単なプログラムの場合
            await httpDataRequest("メインネーム(プログラム名などを入力)/名前を入力する(機能などを入力する。メインネームだけで済む場合はmainなどの名前を使用する。)", "送信したいリクエストまたはデータを送る")
        },
        "例２です。複雑なプログラム用です。": async () => {
            return await new Promise<string>(async resolve => { // 大きなデータを送り、処理をし、完了したかリクエストのデータが完成したら返答をする構文。
                const response = await new Promise<string>(resolve => {
                    const req = new XMLHttpRequest()
                    req.open("POST", "http://" + location.hostname + ":" + location.port + "/API/dataIO/sendFile")
                    req.send("大きなデータ"); //データを送信
                    req.onreadystatechange = async () => {
                        if (req.readyState === 4 && req.status === 200) resolve(req.responseText)
                    } //レスポンスを返す
                })
            })
        }
    }
    ```
 */
export const API = Object.freeze({
    dataIO: {
        parentFolder: async () => { },
        /** このファイル送信APIはベータ&未完成です。保存される場所がおかしい、重いなどの異常な現状が予期されています。 */
        sendFile: async (blob: Blob) => {
            const status = await new Promise<string>(resolve => {
                const req = new XMLHttpRequest()
                req.open("POST", "http://" + location.hostname + ":" + location.port + "/API/dataIO/sendFile")
                req.send(blob); //データを送信
                req.onreadystatechange = async () => {
                    if (req.readyState === 4 && req.status === 200) resolve(req.responseText)
                    console.log(req.readyState, req.status)
                } //レスポンスを返す
            })
            console.log(status)
            return (status === "Request Not Found") ? false : true
        }
    },
    YouTubeDownLoader: {},
    Log: {},
    EnvSetting: {},
    DiscordBot: {},
    FFmpegConverter: {},
    testAPI: {
        one: async (data?: string) => {
            return await httpDataRequest("API/testAPI/one", "TEST:" + (data ? data : "")) as string
        }
    }
})

/**
 * 待機します。ライブラリでは使用しすぎないでください。IOや高負荷の回避におすすめです。
 * @param time 時間を入力
 */
export async function wait(time: number) { await new Promise<void>(resolve => setTimeout(() => resolve(), time)) }

/** CSSのセレクタ(.class、#idなど)を入力しそれに対応したスタイルを返す */
export function getRuleBySelector(selecter: string) {
    for (let i = 0; i !== document.styleSheets.length; i++) //cssの数だけ
        for (let is = 0; is !== document.styleSheets[i].cssRules.length; is++) //ルールの数だけ
            if (selecter === (document.styleSheets[i].cssRules[is] as CSSStyleRule).selectorText) //ルール名と一致するか
                return (document.styleSheets[i].cssRules[is] as CSSStyleRule).style //見つけたら返す
}

export interface ShareData {
    windowSystem?: windowSystem
    mouseCursor?: mouseCursor
}
