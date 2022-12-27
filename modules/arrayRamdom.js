/**
 * 配列をぐっちゃぐちゃにしたげます。にこっ
 * @param {[]} array 配列を入力します。
 * @returns 配列が出力されます。
 */
module.exports.arrayRamdom = array => {
    for (let i = (array.length - 1); i != 0; i--) {
        const random = Math.floor(Math.random() * i)
        let tmp = array[i]
        array[i] = array[random]
        array[random] = tmp
    }
    return array
}