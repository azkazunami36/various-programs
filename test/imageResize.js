const sharp = require("sharp")
const imageSize = require("image-size")
const fs = require("fs")
const readline = require("readline")

/**
 * 画像の自動検出の際、この中から対象にする拡張子を追加する。
 */
const imageExtensions = ["png", "jpg", "jpeg", "tiff"]
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
    let outpasstmp = await questions("変換した後の画像を保存する場所を指定してください。> ")
    outpasstmp = outpasstmp.split("/")
    let outpass = ""
    for (let i = 0; i !== outpasstmp.length; i++) outpass += outpasstmp[i] + "/"
    if (!fs.existsSync(outpass)) process.exit(0)
    const type = [
        "[ファイル名].png",
        "[連番] - [ファイル名].png",
        "[元拡張子] - [ファイル名].png",
        "[連番]_[元拡張子] - [ファイル名].png",
        "[連番].png"
    ]
    for (let i = 0; i !== type.length; i++) console.log("[" + (i + 1) + "] " + type[i])
    const nameType = Number(await questions("上記から命名方法を数字で選択してください。")) - 1
    if (!nameType) process.exit(0)
    const folderContain = await questions("フォルダ内にあるフォルダも画像変換に含めますか？yで同意します。")

    /**
     * @type {{filename: string, extension: string, pass: string, point: string[]}[]}
     */
    const processd = []

    const point = []
    const filepoint = {}
    while (true) {
        let lpass = pass
        for (let i = 0; i !== point.length; i++) lpass += point[i] + "/"
        if (!filepoint[lpass]) filepoint[lpass] = {}
        if (!filepoint[lpass].point) filepoint[lpass].point = 0
        if (!filepoint[lpass].dirents) {
            filepoint[lpass].dirents = await new Promise(resolve => {
                fs.readdir(lpass, { withFileTypes: true }, (err, dirents) => {
                    if (err) throw err
                    resolve(dirents)
                })
            })
        }
        const dirents = filepoint[lpass].dirents
        if (dirents.length === filepoint[lpass].point)
            if (lpass === pass) break
            else point.pop()
        else {
            const name = dirents[filepoint[lpass].point].name
            if (!dirents[filepoint[lpass].point].isDirectory()) {
                const namedot = name.split(".")
                const extension = namedot[namedot.length - 1]
                for (let i = 0; i !== imageExtensions.length; i++)
                    if (imageExtensions[i].match(new RegExp(extension, "i")))
                        processd.push({
                            filename: name.slice(0, -(extension.length + 1)),
                            extension: extension,
                            pass: lpass,
                            point: JSON.parse(JSON.stringify(point))
                        })
            } else if (folderContain === "y" && dirents[filepoint[lpass].point].isDirectory()) point.push(name)
            filepoint[lpass].point++
        }
    }
    console.log(
        "変換元パス: " + pass + "\n" +
        "変換先パス: " + outpass + "\n" +
        "変換先サイズ(縦): " + size + "\n" +
        "変換するファイル数: " + processd.length + "\n" +
        "命名方法: " + type[nameType]
    )
    const permission = await questions("上記のデータで実行してもよろしいですか？yと入力すると続行します。> ")
    if (permission === "y") {
        for (let i = 0; i !== processd.length; i++) await new Promise(async resolve => {
            const fileName = processd[i].filename + "." + processd[i].extension
            const imageW = (await imageSize(processd[i].pass + fileName)).width
            let outfolders = ""
            const point = processd[i].point
            for (let i = 0; i !== point.length; i++) {
                outfolders += point[i] + "/"
                if (!fs.existsSync(outpass + outfolders)) fs.mkdirSync(outpass + outfolders)
            }
            const Stream = fs.createWriteStream(outpass + outfolders + [
                processd[i].filename,
                (i + 1) + " - " + processd[i].filename,
                processd[i].extension + " - " + processd[i].filename,
                (i + 1) + "_" + processd[i].extension + " - " + processd[i].filename,
                i + 1,
            ][nameType] + ".png")
            console.log("ファイル「" + fileName + "」を変換中 (" + (i + 1) + "/" + processd.length + ")")
            sharp(processd[i].pass + fileName).resize((size < imageW) ? size : imageW).png({ quality: 90 }).pipe(Stream)
            Stream.on("finish", resolve)
        })
        console.log("変換が完了しました。")
    }
})()