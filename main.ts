import { discordRealTimeData } from "./ts-library/discord-bot"
import cuiIO from "./ts-library/cuiIO"
import { expressd, expressApp } from "./ts-library/expressd"
import { vpManageClass } from "./ts-library/vpManageClass"
/**
 * 改善する前に、README.mdをお読みください。
 * しかし、読まなくても僕がコードを確認するので、重要事項ではないことはご了承ください。
 * このプログラムはまだ作成段階であり、不安定かつルールが不定かです。
 * そのため、コードのバランス性や読みやすさがとても悪いですが、ご了承ください。
 * さらに、async/awaitを多用しています。
 * 理由はバックグラウンド処理の為です。それらの使用方法を正しくしない場合、
 * 不具合やエラーなど予期しない動作になる可能性がありますので、迷ったらawaitで待機、asyncの利用を推奨します。
 */

(async () => {
	const shareData: vpManageClass.shareData = {}
	cuiIO(shareData) //コンソール画面で直接操作するためのプログラムです。
	expressd.main(shareData) //ブラウザ等から直感的に操作するためのプログラムです。
})()
