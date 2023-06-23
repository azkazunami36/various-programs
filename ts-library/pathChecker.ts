import slashPathStr from "./slashPathStr"
import sfs from "./fsSumwave"
/**
 * 有効なパスかをチェックします。そして、一部の特殊なパスの場合に変換をします
 * @param string 文字列を入力します。
 * @returns 
 */
export async function pathChecker(str: string | string[]) {
    const pass = await (async () => {
        const string = (() => {
            if (typeof str === "string") return str
            else return slashPathStr(str)
        })()
        const passDeli = (string.match(/:\\/)) ? "\\" : "/"
        const passArray = string.split(passDeli)
        let passtmp = ""
        for (let i = 0; i !== passArray.length; i++) passtmp += passArray[i] + (((i + 1) !== passArray.length) ? "/" : "")
        if (await sfs.exsits(passtmp)) return passtmp
        if (passtmp[0] === "\"" && passtmp[passtmp.length - 1] === "\"") passtmp = passtmp.substring(1, passtmp.length - 1)
        if (await sfs.exsits(passtmp)) return passtmp
        if (passtmp[0] === "\'" && passtmp[passtmp.length - 1] === "\'") passtmp = passtmp.substring(1, passtmp.length - 1)
        if (await sfs.exsits(passtmp)) return passtmp
        while (passtmp[passtmp.length - 1] === " ") passtmp = passtmp.slice(0, -1)
        if (await sfs.exsits(passtmp)) return passtmp
        const expType = " ()#~"
        for (let i = 0; i !== expType.length; i++) {
            const type = expType[i]
            const exp = new RegExp("\\\\\\" + type, "g")
            passtmp = passtmp.replace(exp, type)
            if (await sfs.exsits(passtmp)) return passtmp
        }
        return null
    })()
    if (!pass) return null
    const passArray = pass.split("/")
    return passArray
}
export default pathChecker