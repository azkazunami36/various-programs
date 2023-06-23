/**
 * 数字データの末尾に0を足し、文字数を整えるために使えます。
 * @param number 元値データを入力
 * @param fillnum 0を埋める文字数を入力
 * @param option オプションを入力
 * @returns 
 */
export function numFiller(number: number, fillnum: number, option?: {
    /**
     * 文字数を超えた元データを受け取った場合に、文字数を変化させるかを決定させます。
     * 通常はtrueです。
     */
    overflow?: boolean
}): string {
    let overflow = true
    if (option !== undefined) {
        if (option.overflow !== undefined) overflow = option.overflow
    }
    let fillString = ""
    let fillNum = 0
    const numRawLen = String(number).length
    for (let i = 0; i !== ((overflow && numRawLen > fillnum) ? numRawLen : fillnum); i++) {
        fillString += "0"
        fillNum--
    }
    return (fillString + number.toFixed()).slice(fillNum)
}
export default numFiller