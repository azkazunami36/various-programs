import { discordRealTimeData } from "ts-library/discord-bot"
import cuiIO from "ts-library/cuiIO"
import expressd from "ts-library/expressd"

/**
 * 改善する前に、README.mdをお読みください。
 * しかし、読まなくても僕がコードを確認するので、重要事項ではないことはご了承ください。
 */

(async () => {
	const shareData: {
		discordBot?: {
			[botName: string]: discordRealTimeData
		}
	} = {}
	cuiIO(shareData) //コンソール画面で直接操作するためのプログラムです。
	expressd.main(shareData) //ブラウザ等から直感的に操作するためのプログラムです。
})()
