
import readline from "readline";
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
}
export default consoleUIPrograms