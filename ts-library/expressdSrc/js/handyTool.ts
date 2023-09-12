/**
 * httpリクエストできる関数
 * @param request URLに含ませるリクエスト(処理分岐)を入力
 * @param send 送信したいテキスト(JSONもstringifyで可能)
 * @returns 
 */
export async function httpDataRequest(request: string, send: string) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/" + request)
        xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8")
        xhr.send(send); //データを送信
        xhr.onreadystatechange = async () => { if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.responseText) } //レスポンスを返す
    })
}

interface APISendReturns {
    YouTubeDownLoader: { type: "YouTubeDownLoader" }
    dataIO: { type: "dataIO" }
    Log: { type: "Log" }
    EnvSetting: { type: "EnvSetting" }
    DiscordBot: { type: "DiscordBot" }
    FFmpegConverter: { type: "FFmpegConverter" }
}
export async function APISend<K extends keyof APISendReturns>(request: K, send: string): Promise<APISendReturns[K]> {
    let sa = ""
    return sa as any
}

/**
 * 待機します。ライブラリでは使用しすぎないでください。IOや高負荷の回避におすすめです。
 * @param time 時間を入力
 */
export async function wait(time: number) { await new Promise<void>(resolve => setTimeout(() => resolve(), time)) }
