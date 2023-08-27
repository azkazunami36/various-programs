import cuiIO from "./ts-library/cuiIO.js"
import dataIO from "./ts-library/dataIO.js"
import expressd from "./ts-library/expressd.js"
import vpManageClass from "./ts-library/vpManageClass.js"
import youTubeDownloader from "./ts-library/youtubeDownloader.js"
import ffmpegConverter from "./ts-library/ffmpegConverter.js"

// プログラムを改善する前に、Wikiをお読みください。

/** 常駐プログラムなどの関数やクラス、データなどを保存する場所です。*/
const shareData: vpManageClass.shareData = {}
dataIO.ny.initer(shareData) // データの保存先や小規模データを管理するためのプログラムです。
youTubeDownloader.youTubeDownloader.initer(shareData) // YouTubeの動画・音声データやタイトル、作者名などのメタデータ全般を管理するためのプログラムです。
ffmpegConverter.initer(shareData) // 動画や音声などのソースを扱い、変換や圧縮などをするためのプログラムです。
cuiIO.initer(shareData) //コンソール画面で直接操作するためのプログラムです。
expressd.expressd.initer(shareData) //ブラウザ等から直感的に操作するためのプログラムです。
