/**
 * 拡張子と名前で分割します。
 */
export function splitExt(name: string) {
    const splitedName = name.split(".")
    const extension = splitedName[splitedName.length - 1]
    return {
        filename: name.slice(0, -(extension.length + 1)),
        extension: extension
    }
}
export default splitExt