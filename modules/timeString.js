/**
 * Numberで構成された秒数を文字列「x時間x分x秒」に変換します。
 * @param {Number} sec 秒数を入力します。
 * @returns 文字列を返します。
 */
module.exports.timeString = (sec) => {
    let output = ""
    let minute = 0
    let hour = 0
    for (minute; sec > 59; minute++) sec -= 60
    for (hour; minute > 59; hour++) minute -= 60
    if (hour != 0) output += hour + "時間"
    if (minute != 0) output += minute + "分"
    output += (sec).toFixed() + "秒"
    return output
}