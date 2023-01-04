/**
 * Numberで構成された秒数を文字列「x時間x分x秒」に変換します。
 * @param {Number} sec 秒数を入力します。
 * @returns 文字列を返します。
 */
module.exports.timeString = sec => {
    let minute = 0, hour = 0
    while (sec > 59) { sec -= 60; minute++ }
    while (minute > 59) { minute -= 60; hour++ }
    return ((hour != 0) ? hour + "時間" : "") +
        ((minute != 0) ? minute + "分" : "") +
        sec.toFixed() + "秒"
}
