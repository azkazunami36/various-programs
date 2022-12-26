/**
 * 数値をByteからMBに変換します。
 * @param {Number} byte Byteを入力します。
 * @returns {Number} MBを返します。
 */
module.exports.mbString = (byte) => { return (byte / 1024 / 1024).toFixed(1) }