import dataIO from "./dataIO.js"
import sfs from "./fsSumwave.js"

/**
 * # Handy Tool
 * 名前の通り、日本語で便利ツールです。様々な便利関数がまとまっています。
 * どこの名前空間にも属さない、汎用ツールをここに格納しています。
 * 裏(プログラム内)でしか活躍しない関数もあれば、表面(実作業)でも使える関数もあります。
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
    /**
     * フォルダ内のファイルの名前をリストとしてテキスト出力または保存します。
     * @param folderPath フォルダパスを入力します。
     * @param listerOption File Listerに入力するオプションを入力します。
     * @returns ファイル名をリスト化したテキストを出力します。
     */
    export async function fileNameTextList(folderPath: string[], listerOption?: {
        contain?: boolean | undefined;
        extensionFilter?: string[] | undefined;
        invFIleIgnored?: boolean | undefined;
        macosInvIgnored?: boolean | undefined;
    }, savePath?: string[]) {
        const list = await dataIO.fileLister(folderPath, listerOption)
        let text = ""
        for (let i = 0; i !== list.length; i++) text += list[i].filename + "\n"
        if (savePath) sfs.writeFile(dataIO.slashPathStr(savePath) + "/ファイル名リスト.txt", text)
        return text
    }
    /**
     * 特定の個所を特定の文字列に置き換えます。
     * @param string 置き換え元の文字列を入力
     * @param num 置き換えたい箇所の番号
     * @param replaceStr 置き換えられる文字列
     * @returns 置き換えられた文字列
     */
    export function replaces(string: string, num: number, replaceStr: string) {
        const start = string.slice(0, num)
        const end = string.slice(num + replaceStr.length, string.length)
        return start + replaceStr + end
    }
    /**
     * ランダムな英数字の文字列を生成可能です。
     * @param length 文字列の長さを入力します。
     * @param option 様々なオプションをつけることが出来ます。
     */
    export function randomStringCreate(length: number, option: {
        /**
         * 小文字の英字を含めるかを決めます。
         */
        str?: boolean
        /**
         * 大文字の英字を含めるかを決めます。
         */
        num?: boolean
        /**
         * 数字を含めるかを決めます。
         */
        upstr?: boolean
        /**
         * ランダム文字列に含めたい文字を文字列で入力します。
         */
        originalString?: string
        /**
         * 特定の個所に特定の文字列を置きたい場合に指定でき、複数個所を指定することが出来ます。
         * 場合によっては指定した文字列の長さを超える可能性があります。
         */
        setStr?: {
            /**
             * どこの箇所を置き換えるかを指定します。0からカウントされます。
             */
            setNum: number
            /**
             * 何の文字にするかを指定します。１文字推奨です。
             */
            string: string
        }[]
    }) {
        const str = "abcdefghijklmnopqrstuvwxyz"
        const num = "0123456789"
        const upstr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let conster = ""
        if (option.str) conster += str
        if (option.num) conster += num 
        if (option.upstr) conster += upstr
        if (option.originalString) conster += option.originalString
        if (conster === "") return ""
        let string = ""
        for (let i = 0; i !== length; i++) string += conster[Math.floor(Math.random() * conster.length)]
        if (option.setStr) for (let i = 0; i !== option.setStr.length; i++) string = replaces(string, option.setStr[i].setNum, option.setStr[i].string)
        return string
    }
}
export default handyTool
