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
    while(passtmp[passtmp.length - 1] === " ") passtmp = passtmp.slice(0, -1)
    let pass = ""
    passtmp = passtmp.split("/")
    for (let i = 0; i != passtmp.length; i++) pass += passtmp[i] + "/"
    if (!fs.existsSync(pass)) process.exit(0)
    let outpasstmp = await questions("変換した後の画像を保存する場所を指定してください。> ")
    while(outpasstmp[outpasstmp.length - 1] === " ") outpasstmp = outpasstmp.slice(0, -1)
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
    if (!(nameType + 1) || type.length < (nameType + 1)) process.exit(0)
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
        let converting = 0
        let convertPoint = 0
        const maxconvert = 20
        const interval = setInterval(() => display, 8)
        convert()
        function display() {
            const windowSize = process.stdout.getWindowSize()
            const percent = convertPoint / processd.length
            const oneDisplay = "変換中(" + convertPoint + "/" + processd.length + ") " +
                (percent * 100).toFixed() + "%["
            const twoDisplay = "]"
            let progress = ""
            let length = 0
            for (let i = 0; i !== oneDisplay.length; i++)
                oneDisplay[i].match(/[ -~]/) ? length += 1 : length += 2
            for (let i = 0; i !== twoDisplay.length; i++)
                twoDisplay[i].match(/[ -~]/) ? length += 1 : length += 2
            const progressLength = windowSize[0] - 3 - length
            const displayProgress = Number((percent * progressLength).toFixed())
            for (let i = 0; i < displayProgress; i++) progress += "#"
            for (let i = 0; i < progressLength - displayProgress; i++) progress += " "
            const display = oneDisplay + progress + twoDisplay
            readline.cursorTo(process.stdout, 0)
            process.stdout.clearLine()
            process.stdout.write(display)
        }

        async function convert() {
            if (converting === maxconvert) return
            if (convertPoint === processd.length) {
                if (converting === 0) console.log("\n変換が完了しました。")
                clearInterval(interval)
                return
            }
            const i = convertPoint
            convertPoint++
            converting++
            const fileName = processd[i].filename + "." + processd[i].extension
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
            display()
            convert()
            await new Promise(async resolve => {
                const imageW = (await imageSize(processd[i].pass + fileName)).width
                sharp(processd[i].pass + fileName)
                    .resize((size < imageW) ? size : imageW)
                    .png()
                    .pipe(Stream)
                Stream.on("finish", resolve)
            })
            converting--
            convert()
        }
    }
})()