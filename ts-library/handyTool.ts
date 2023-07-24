/**
 * # Handy Tool
 * 名前の通り、日本語で便利ツールです。様々な便利関数がまとまっています。
 * どこの名前空間にも属さない、汎用ツールをここに格納しています。
 */
export namespace handyTool {
    /**
     * 配列をぐっちゃぐちゃにしたげます。にこっ
     * @param array 配列を入力します。
     * @returns 配列が出力されます。
     */
    export function arrayRandom<T>(array: T[]): T[] {
        for (let i = 0; array.length !== i; i++) {
            const rm = Math.floor(Math.random() * i)
            let tmp = array[i]
            array[i] = array[rm]
            array[rm] = tmp
        }
        return array
    }
    /**
     * 存在しない連想配列の初期化をし、undefinedを回避します。
     * キー名が違う際に内型定義が変わる場合は利用しないでください。union型となってしまい、コードの記述がうまくいかなくなります。
     * @param keyName キー名を入力します。
     * @param datas キー名が入るとされる連想配列を入力します。
     * @param set 初期化時に使用するデータを入力します。
     * @returns 参照渡しがそのまま受け継がれたデータを出力します。
     */
    export function def<T>(keyName: string, datas: Record<string, T | undefined>, set: T): T {
        let value = datas[keyName]
        if (value === undefined) {
            value = set
            datas[keyName] = value
        }
        return value
    }
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
    /**
     * 待機します。ライブラリでは使用しすぎないでください。IOや高負荷の回避におすすめです。
     * @param time 時間を入力
     */
    export async function wait(time: number) { await new Promise<void>(resolve => setTimeout(() => resolve(), time)) }
    /**
     * 大文字や小文字の大きさを区別し、文字数を算出します。
     */
    export function textLength(string: string) {
        let length = 0
        for (let i = 0; i !== string.length; i++) string[i].match(/[ -~]/) ? length += 1 : length += 2
        return length
    }
}
export default handyTool
