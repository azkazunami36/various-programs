import cuiIO from "./ts-library/cuiIO.js"
import dataIO from "./ts-library/dataIO.js"
import expressd from "./ts-library/expressd.js"
import vpManageClass from "./ts-library/vpManageClass.js"
import youTubeDownloader from "./ts-library/youtubeDownloader.js"
import ffmpegConverter from "./ts-library/ffmpegConverter.js"

// プログラムを改善する前に、Wikiをお読みください。

/** 常駐プログラムなどの関数やクラス、データなどを保存する場所です。*/
const shareData: vpManageClass.shareData = {};
(async () => {
    try {
        await dataIO.ny.initer(shareData) // データの保存先や小規模データを管理するためのプログラムです。
        await youTubeDownloader.youTubeDownloader.initer(shareData) // YouTubeの動画・音声データやタイトル、作者名などのメタデータ全般を管理するためのプログラムです。
        await ffmpegConverter.initer(shareData) // 動画や音声などのソースを扱い、変換や圧縮などをするためのプログラムです。
        await cuiIO.initer(shareData) //コンソール画面で直接操作するためのプログラムです。
        await expressd.expressd.initer(shareData) //ブラウザ等から直感的に操作するためのプログラムです。
    } catch (e) {
        console.log("申し訳ありません。プログラムの起動中に予想外のエラーが発生しました。次のエラーを報告してください。", e)
        console.log("このプログラムは一度シャットダウン処理を行った後、5秒以内に終了されなかった場合は強制終了が行われます。")
        try {
            vpManageClass.shutdown(shareData, { forced: true })
        } catch (e) {
            console.log("終了処理中にエラーが発生しました。強制終了を実行します。")
            process.exit(1)
        }
    }
})
