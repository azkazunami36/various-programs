import cuiIO from "./ts-library/cuiIO"
import dataIO from "./ts-library/dataIO"
import expressd from "./ts-library/expressd"
import vpManageClass from "./ts-library/vpManageClass"
/**
 * 改善する前に、README.mdをお読みください。
 * しかし、読まなくても僕がコードを確認するので、重要事項ではないことはご了承ください。
 * 
 * このプログラムはまだ作成段階であり、不安定かつルールが不定かです。
 * そのため、コードのバランス性や読みやすさがとても悪いですが、ご了承ください。
 * 
 * さらに、async/awaitを多用しています。
 * 理由はバックグラウンド処理の為です。それらの使用方法を正しくしない場合、
 * 不具合やエラーなど予期しない動作になる可能性がありますので、迷ったらawaitで待機、asyncの利用を推奨します。
 * 
 * クラスには殆どの場合initerというものが用意されており、  
 * 非同期で実行しないとならない関数が含まれている際によく確認することが出来ます。コードの短縮となる
 */

(async () => {
	/**
	 * 常駐プログラムなどの関数やクラス、データなどを保存する場所です。
	 */
	const shareData: vpManageClass.shareData = {}
	shareData.dataIO = new dataIO.ny()
	cuiIO(shareData) //コンソール画面で直接操作するためのプログラムです。
	shareData.expressd = new expressd.expressd() //ブラウザ等から直感的に操作するためのプログラムです。
})()
