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
export default arrayRandom