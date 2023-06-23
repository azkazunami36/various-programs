/**
 * 大文字や小文字の大きさを区別し、文字数を算出します。
 */
export function textLength(string: string) {
    let length = 0
    for (let i = 0; i !== string.length; i++) string[i].match(/[ -~]/) ? length += 1 : length += 2
    return length
}
export default textLength