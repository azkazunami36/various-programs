//@ts-check

/**
 * TypeScriptの型アサーション(as)の代わりに利用するものです。
 */
export const assertions = {
    /**
     * @param { any } element 
     * @return { HTMLElement | null }
     */
    HTMLElement: (element) => {
        return element
    },
    /**
     * @param { any } element 
     * @return { HTMLInputElement | null }
     */
    HTMLInputElement: (element) => {
        return element
    }
}
/**
 * httpリクエストできる関数
 * @param {string} request URLに含ませるリクエスト(処理分岐)を入力
 * @param {string} send 送信したいテキスト(JSONもstringifyで可能)
 * @returns 
 */
export async function httpDataRequest(request, send) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/" + request)
        xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8")
        xhr.send(send); //データを送信
        xhr.onreadystatechange = async () => { if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.responseText) } //レスポンスを返す
    })
}


export async function APISend(request, send) {
    /**
     * @type {any}
     */
    let sa
    return {
        type: sa
    }
}

/**
 * 待機します。ライブラリでは使用しすぎないでください。IOや高負荷の回避におすすめです。
 * @param {number} time 時間を入力
 */
export async function wait(time) { await /** @type {Promise<void>} */(new Promise(resolve => setTimeout(() => resolve(), time))) }
