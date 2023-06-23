/**
 * 存在しない連想配列の初期化をし、undefinedを回避します。
 * キー名が違う際に内型定義が変わる場合は利用しないでください。union型となってしまい、コードの記述がうまくいかなくなります。
 * @param keyName キー名を入力します。
 * @param datas キー名が入るとされる連想配列を入力します。
 * @param set 初期化時に使用するデータを入力します。
 * @returns 参照渡しがそのまま受け継がれたデータを出力します。
 */
const def = <T>(keyName: string, datas: Record<string, T | undefined>, set: T): T => {
    let value = datas[keyName]
    if (value === undefined) {
        value = set
        datas[keyName] = value
    }
    return value
}
export default def