const sharp = require("sharp")
const imageSize = require("image-size")
const fs = require("fs")
const readline = require("readline")

/**
 * 画像の自動検出の際、この中から対象にする拡張子を追加する。
 */
const imageExtensions = ["png", "jpg", "jpeg", "tiff", "ico"]
let ava = ""
for (let i = 0; i !== imageExtensions.length; i++) {
    ava += imageExtensions[i]
    if ((i + 1) !== imageExtensions.length) ava += "、"
}
console.log(
    "画像を一括変換するための、超簡易プログラムです。\n" +
    ava + "の" + imageExtensions.length + "つの種類を検出し、全てをpngに変換します。"
)
const questions = text => {
    const interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => interface.question(text, answer => { resolve(answer); interface.close(); }));
};
(async () => {
    const size = Number(await questions("変換したいサイズを指定してください。> "))
    if (!size) process.exit(0)
    let passtmp = await questions("画像が入っているフォルダを指定してください。> ")
    let pass = ""
    passtmp = passtmp.split("/")
    for (let i = 0; i != passtmp.length; i++) pass += passtmp[i] + "/"
    if (!fs.existsSync(pass)) process.exit(0)
    const list = await new Promise(resolve => {
        fs.readdir(pass, { withFileTypes: true }, (err, dirents) => {
            if (err || !dirents) {
                console.log("エラーです。", err ? err : dirents)
                process.exit(0)
            }
            const extensions = [];
            const filenameList = [];
            for (let i = 0; i != dirents.length; i++) if (!dirents[i].isDirectory()) {
                const name = dirents[i].name
                const namedot = name.split(".")
                const extension = namedot[namedot.length - 1]
                for (let i = 0; i != imageExtensions.length; i++) {
                    const regexp = new RegExp(extension, "i")
                    if (imageExtensions[i].match(regexp)) {
                        filenameList.push(name.slice(0, -(extension.length + 1)))
                        extensions.push(extension)
                    }
                }
            }
            resolve({ extensions: extensions, filenameList: filenameList })
        })
    })
    let outpasstmp = await questions("変換した後の画像を保存する場所を指定してください。> ")
    outpasstmp = outpasstmp.split("/")
    let outpass = ""
    for (let i = 0; i != outpasstmp.length; i++) outpass += outpasstmp[i] + "/"
    console.log(outpass, outpasstmp)
    if (!fs.existsSync(outpass)) process.exit(0)
    console.log(
        "変換元パス: " + pass + "\n" +
        "変換先パス: " + outpass + "\n" +
        "変換先サイズ(縦): " + size + "\n" +
        "変換するファイル数: " + list.filenameList.length
    )
    const permission = await questions("上記のデータで実行してもよろしいですか？yと入力すると続行します。> ")
    if (permission === "y") for (let i = 0; i !== list.filenameList.length; i++) await new Promise(async resolve => {
        const fileName = list.filenameList[i] + "." + list.extensions[i]
        const imageW = (await imageSize(pass + fileName)).width
        const Stream = fs.createWriteStream(outpass + list.filenameList[i] + ".png")
        console.log("ファイル「" + fileName + "」を変換中 (" + (i + 1) + "/" + list.filenameList.length + ")")
        sharp(pass + fileName).resize((size < imageW) ? size : imageW).png({ quality: 90 }).pipe(Stream)
        Stream.on("finish", resolve)
    })
    console.log("変換が完了しました。")
})()