/**
 * httpリクエストできる関数
 * @param request URLに含ませるリクエスト(処理分岐)を入力
 * @param send 送信したいテキスト(JSONもstringifyで可能)
 * @returns 
 */
export async function httpDataRequest(request: string, send: string) {
    return await new Promise(resolve => {
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
            return (status === "Not Found") ? false : true
        }
    },
    YouTubeDownLoader: {},
    Log: {},
    EnvSetting: {},
    DiscordBot: {},
    FFmpegConverter: {}
})

/**
 * 待機します。ライブラリでは使用しすぎないでください。IOや高負荷の回避におすすめです。
 * @param time 時間を入力
 */
export async function wait(time: number) { await new Promise<void>(resolve => setTimeout(() => resolve(), time)) }
