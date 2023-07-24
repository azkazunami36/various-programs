import readline from "readline"

import handyTool from "./handyTool"


namespace consoleUIPrograms {
	/**
	 * ユーザーから文字列を受け取ります。
	 * @param text ユーザーへの質問文を入力します。
	 * @returns 
	 */
	export async function question(text: string): Promise<string> {
		const iface =
			readline.createInterface({ input: process.stdin, output: process.stdout })
		return await
			new Promise(resolve => iface.question(text + "> ", answer => { iface.close(); resolve(answer) }))
	}
	/**
	 * 文字列配列からユーザー入力を利用し番号を選択させます。
	 * @param array 文字列配列を入力します。
	 * @param title 文字列配列の意図を入力します。
	 * @param questionText 質問文を入力します。
	 * @param manyNumNotDetected 配列以外の数字を選択された際にnullを返さないかどうかを決定します。
	 * @returns 
	 */
	export async function choice(array: string[], title?: string, questionText?: string, manyNumNotDetected?: boolean): Promise<number | null> {
		console.log((title ? title : "一覧") + ": ")
		for (let i = 0; i !== array.length; i++) console.log("[" + (i + 1) + "] " + array[i])
		const request = Number(await question(questionText ? questionText : "上記から数字で選択してください。"))
		if (Number.isNaN(request)) return null
		if (!manyNumNotDetected && request > array.length || request < 1) return null
		return request
	}
	/**
	 * ユーザーの文字列からture、falseを決定します。
	 * @param text ユーザーへの質問文を入力します。
	 * @returns 
	 */
	export async function booleanIO(text: string): Promise<boolean> {
		switch (await question(text)) {
			case "y": return true
			case "yes": return true
			case "true": return true
			case "ok": return true
			default: return false
		}
	}
	export class progress {
		#viewed: boolean = false
		/**
		 * 現在の進行度または最大より小さい値を入力します。
		 */
		now: number = 0
		/**
		 * 100%を計算するために、最大値または合計値をここに入力します。
		 */
		total: number = 0
		/**
		 * プログレスバー更新間隔をms秒で入力します。
		 */
		interval: number = 100
		/**
		 * プログレスバーの左に説明を入れます。
		 */
		viewStr: string = "進行中..."
		/**
		 * プログレスバーに更なる小さな進行を表すためのものです。
		 * 例でいう50%から51%の間の処理状況が具現化できます。
		 */
		relativePercent: {
			now: number,
			total: number
		} = {
				now: 0,
				total: 0
			}
		/**
		 * プログレスバーの表示を開始します。
		 */
		view() {
			if (!this.#viewed) this.#viewed = true
			this.#view()
		}
		/**
		 * プログレスバーの表示をするかを設定します。
		 * trueを設定すると自動で表示を開始します。
		 */
		set viewed(type: boolean) {
			this.#viewed = type
			if (this.#viewed) this.#view
		}
		async #view() {
			if (!this.#viewed) return
			const windowSize = process.stdout.getWindowSize()
			const percent = this.now / this.total
			const miniPercent = this.relativePercent.now / this.relativePercent.total
			const oneDisplay = this.viewStr + "(" + this.now + "/" + this.total + ") " +
				((percent ? percent : 0) * 100).toFixed() + "%["
			const twoDisplay = "]"
			let progress = ""
			const length = handyTool.textLength(oneDisplay) + handyTool.textLength(twoDisplay)
			const progressLength = windowSize[0] - 3 - length
			const displayProgress = Number((((percent ? percent : 0) + ((miniPercent ? miniPercent : 0) / this.total)) * progressLength).toFixed())
			for (let i = 0; i < displayProgress; i++) progress += "#"
			for (let i = 0; i < progressLength - (displayProgress); i++) progress += " "
			const display = oneDisplay + progress + twoDisplay
			readline.cursorTo(process.stdout, 0)
			process.stdout.clearLine(0)
			process.stdout.write(display)
			await handyTool.wait(this.interval)
			this.#view()
		}
	}
	/**
	 * プログラムをユーザーが選択するための簡易クラスです。プログラムの選択肢として簡潔にし、確定されると自動で実行されます。
	 */
	export class funcSelect {
		message: {
			topMsg?: string,
			userToMsg?: string
		} = {}
		selectingFuncName: string = ""
		errorView: boolean = false
		loop: boolean = false
		end: boolean = false
		functions: {
			[programName: string]: (() => Promise<void>)
		} = {}
		constructor(
			functions: {
				[programName: string]: (() => Promise<void>)
			},
			option?: {
				/**
				 * ユーザーに表示するメッセージを入力します。
				 */
				message?: {
					topMsg?: string,
					userToMsg?: string
				},
				/**
				 * プログラム選択にこの関数を使用した場合、エラー時の特定となる名前を決定してください。
				 */
				selectingFuncName?: string,
				/**
				 * catchされたエラーをコンソールに直接出力しますか？※開発者向け
				 */
				errorView?: boolean,
				/**
				 * 繰り返しプログラム選択を刺せるかどうかを設定します。
				 * この場合、クラス内のendを手動でtrueに置き換えることによってループを終了できます。
				 */
				loop?: boolean
			}
		) {
			this.functions = functions
			if (option) {
				if (option.message) this.message = option.message
				if (option.selectingFuncName) this.selectingFuncName = option.selectingFuncName
				if (option.errorView) this.errorView = option.errorView
				if (option.loop) this.loop = option.loop
			}
		}
		async view() {
			let stats = false
			while (!this.end) {
				const programChoice = await choice(
					Object.keys(this.functions),
					this.message.topMsg ? this.message.topMsg : "利用可能な操作一覧",
					this.message.userToMsg ? this.message.userToMsg : "利用する機能を選択してください。"
				)
				if (programChoice === null) {
					console.log("選択された番号は利用できません。最初からやり直してください。")
					stats = false
					continue
				}
				const choiceProgramName = Object.keys(this.functions)[programChoice - 1]
				try {
					await this.functions[choiceProgramName]()
					stats = true
				} catch (e) {
					console.log("「" + choiceProgramName + "」でエラーを確認しました。" + (this.selectingFuncName ? "名称:" + this.selectingFuncName : ""))
					if (this.errorView) console.log(e)
					stats = false
				}
				if (!this.loop) this.loop = true
			}
			return stats
		}
	}
}
export default consoleUIPrograms
