import fs from "fs"

import fileLister from "@/ts-library/fileLister"
import pathChecker from "@/ts-library/pathChecker"
import consoleUIPrograms from "@/ts-library/consoleUIPrograms"
import sfs from "@/ts-library/fsSumwave"
import slashPathStr from "@/ts-library/slashPathStr"

(async () => {
    const folderPath = await pathChecker(await consoleUIPrograms.question("フォルダを入力してください。"))
    if (folderPath !== null) {
        const list = await fileLister(folderPath)
        let text = ""
        for (let i = 0; i !== list.length; i++) text += list[i].filename + "\n"
        const savePath = await pathChecker(await consoleUIPrograms.question("テキストの保存先フォルダを入力してください。"))
        if (savePath) sfs.writeFile(slashPathStr(savePath) + "/ファイル名リスト.txt", text)
    }
})()
