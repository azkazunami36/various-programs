import cuiIO from "./ts-library/cuiIO2.js"
import vpManageClass from "./ts-library/vpManageClass.js"

// プログラムを改善する前に、Wikiをお読みください。

/** 常駐プログラムなどの関数やクラス、データなどを保存する場所です。*/
const ShareData = new vpManageClass.ShareData();
(async () => {
    try {
        await ShareData.cuiIO.start()
    } catch (e) {
        console.log("申し訳ありません。プログラムの起動・実行中に予想外のエラーが発生しました。次のエラーを報告してください。")
        console.log(e)
        console.log("このプログラムは一度シャットダウン処理を行った後、5秒以内に終了されなかった場合は強制終了が行われます。")
        await shutdown()
    }
})()
process.on("SIGINT", async () => {
    console.log(
        "終了キーが押されました。この方法でVarious Programsを終了しないでください。\n" +
        "シャットダウンの準備をしています。終了するまで時間がかかる恐れがあります。"
    )
    await shutdown()
    console.log("シャットダウンが終了しました。")
})

async function shutdown() {
    try {
        await vpManageClass.shutdown(ShareData, { forced: true }) // シャットダウン試行
    } catch (e) { // シャットダウンでエラーが起きると
        console.log(e)
        console.log("終了処理中にエラーが発生しました。強制終了を実行します。")
        process.exit(1)
    }
}
