/**
 * 文字列配列を元にスラッシュ付きのパス型に変換します。
 * @param passArray 文字列配列を入力します。
 * @returns 
 */
export function slashPathStr(passArray: string[]) {
    let passtmp = ""
    for (let i = 0; i !== passArray.length; i++) passtmp += passArray[i] + (((i + 1) !== passArray.length) ? "/" : "")
    return passtmp
}
export default slashPathStr