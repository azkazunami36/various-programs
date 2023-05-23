import readline from "readline"
import express from "express"
import fs from "fs"
import imageSize from "image-size"
import sharp from "sharp"
import ffmpeg from "fluent-ffmpeg"
import Discord from "discord.js"
import net from "net"
import crypto from "crypto"
import EventEmitter from "events"
import ytdl from "ytdl-core"
/**
 * 改善する前に、README.mdをお読みください。
 * しかし、読まなくても僕がコードを確認するので、重要事項ではないことはご了承ください。
 */

namespace sumtool {
	interface tempTime {
		sec: number,
		secRaw: number
		min: number,
		minRaw: number,
		hour: number,
		hourRaw: number,
		days: number,
		daysRaw: number,
		year: number,
		convertTime: number
	}
	interface toStringOption {
		days?: boolean,
		year?: boolean,
		count?: {
			sec?: string,
			min?: string,
			hour?: string,
			days?: string,
			year?: string
		}
		fill?: number
		timeString?: number
	}
	/**
	 * 秒単位のnumberを秒、分、時間、日、年に変換します。
	 * 現在はまだ高効率ではありません。
	 */
	export class time {
		#sec = 0
		#secRaw = 0
		#min = 0
		#minRaw = 0
		#hour = 0
		#hourRaw = 0
		#days = 0
		#daysRaw = 0
		#year = 0
		#convertTime = 0
		/**
		 * timeクラスに前回のデータを引き継ぐ際に使用します。
		 */
		constructor(rawData?: tempTime) {
			if (rawData) {
				this.#sec = rawData.sec,
					this.#secRaw = rawData.secRaw,
					this.#min = rawData.min,
					this.#minRaw = rawData.minRaw,
					this.#hour = rawData.hour,
					this.#hourRaw = rawData.hourRaw,
					this.#days = rawData.days,
					this.#daysRaw = rawData.daysRaw,
					this.#year = rawData.year,
					this.#convertTime = rawData.convertTime
			}
		}
		/**
		 * 入力した値分のms時間要します。
		 * ```typescript
		 * (async() => {
		 *     const time = new sumtool.time()
		 *     await time.count(1000) //１秒以上の計算を要します。
		 *     console.log(time.toString()) //16分40秒
		 * })()
		 * ```
		 */
		async count(seconds: number) {
			const converttime = Date.now()
			if (this.#secRaw !== 0) {
				const up = Math.sign(seconds)
				let num = 0
				if (up === 1) while (num < seconds) {
					this.setting(true)
					num++
					await wait(1)
				}
				if (up === -1) while (seconds < num) {
					this.setting(false)
					num--
					await wait(1)
				}
			} else {
				this.#secRaw = seconds
				this.#sec = this.#secRaw % 60
				this.#minRaw = this.#secRaw / 60
				this.#min = this.#minRaw % 60
				this.#hourRaw = this.#minRaw / 60
				this.#hour = this.#hourRaw % 60
				this.#daysRaw = this.#hourRaw / 60
				this.#days = this.#daysRaw % 60
				this.#year = (this.#daysRaw / 60) % 60
			}
			this.#convertTime = Date.now() - converttime
			return { toJSON: this.toJSON, toString: this.toString }
		}
		setting(up: boolean) {
			if (up) {
				this.#sec++
				this.#secRaw++
				if (this.#sec === 60) {
					this.#sec = 0
					this.#min++
					this.#minRaw++
				} else return
				if (this.#min === 60) {
					this.#min = 0
					this.#hour++
					this.#hourRaw++
				} else return
				if (this.#hour === 24) {
					this.#hour = 0
					this.#days++
					this.#daysRaw++
				} else return
				if (this.#days === 365) {
					this.#days = 0
					this.#year++
				}
			} else {
				this.#sec--
				this.#secRaw--
				if (this.#sec === -1) {
					this.#sec = 59
					this.#min--
					this.#minRaw--
				} else return
				if (this.#min === -1) {
					this.#min = 59
					this.#hour--
					this.#hourRaw--
				} else return
				if (this.#hour === -1) {
					this.#hour = 23
					this.#days--
					this.#daysRaw--
				} else return
				if (this.#days === -1) {
					this.#days = 364
					this.#year--
				}
			}
			return up
		}
		toString(option?: toStringOption) {
			const outputRaw = { days: false, year: false }
			const fill = {
				fillnum: 1
			}
			const counter = { sec: "秒", min: "分", hour: "時間", days: "日", year: "年" }
			if (option !== undefined) {
				if (option.days) outputRaw.days = true
				if (option.year) outputRaw.year = true, outputRaw.days = true
				if (option.count !== undefined) {
					const count = option.count
					if (count.year !== undefined) counter.year = count.year
					if (count.days !== undefined) counter.days = count.days
					if (count.hour !== undefined) counter.hour = count.hour
					if (count.min !== undefined) counter.min = count.min
					if (count.sec !== undefined) counter.sec = count.sec
				}
				if (option.fill !== undefined) fill.fillnum = option.fill
			}
			const sec = this.#sec
			const min = this.#min
			const hour = outputRaw.days ? this.#hour : this.#hourRaw
			const days = outputRaw.year ? this.#days : this.#daysRaw
			const year = this.#year
			let timeString = 0
			if (min !== 0) timeString = 1
			if (hour !== 0) timeString = 2
			if (outputRaw.days && days !== 0) timeString = 3
			if (outputRaw.year && year !== 0) timeString = 4
			if (option && option.timeString !== undefined) timeString = option.timeString
			return (3 < timeString ? numfiller(year, fill.fillnum) + counter.year : "") +
				(2 < timeString ? numfiller(days, fill.fillnum) + counter.days : "") +
				(1 < timeString ? numfiller(hour, fill.fillnum) + counter.hour : "") +
				(0 < timeString ? numfiller(min, fill.fillnum) + counter.min : "") +
				numfiller(sec, fill.fillnum) + counter.sec
		}
		toJSON(): tempTime {
			return {
				sec: this.#sec,
				secRaw: this.#secRaw,
				min: this.#min,
				minRaw: this.#minRaw,
				hour: this.#hour,
				hourRaw: this.#hourRaw,
				days: this.#days,
				daysRaw: this.#daysRaw,
				year: this.#year,
				convertTime: this.#convertTime
			}
		}
	}
	/**
	 * 数字データの末尾に0を足し、文字数を整えるために使えます。
	 * @param number 元値データを入力
	 * @param fillnum 0を埋める文字数を入力
	 * @param option オプションを入力
	 * @returns 
	 */
	export function numfiller(number: number, fillnum: number, option?: {
		/**
		 * 文字数を超えた元データを受け取った場合に、文字数を変化させるかを決定させます。
		 * 通常はtrueです。
		 */
		overflow?: boolean
	}): string {
		let overflow = true
		if (option !== undefined) {
			if (option.overflow !== undefined) overflow = option.overflow
		}
		let fillString = ""
		let fillNum = 0
		const numRawLen = String(number).length
		for (let i = 0; i !== ((overflow && numRawLen > fillnum) ? numRawLen : fillnum); i++) {
			fillString += "0"
			fillNum--
		}
		return (fillString + number.toFixed()).slice(fillNum)
	}
	namespace sfs {
		/**
		 * fsの関数を非同期関数にしたものです。
		 * @param pass パスを入力します。
		 * @returns 
		 */
		export async function exsits(pass: string): Promise<Boolean> { return await new Promise(resolve => { fs.access(pass, err => resolve(err === null)) }) }
		/**
		 * fsの関数を非同期関数にしたものです。
		 * @param pass パスを入力します。
		 * @returns 
		 */
		export async function mkdir(pass: string): Promise<boolean> { return await new Promise<boolean>(resolve => fs.mkdir(pass, err => resolve(err === null))) }
		/**
		 * fsの関数を非同期関数にしたものです。
		 * @param pass パスを入力します。
		 * @returns 
		 */
		export async function readFile(pass: string): Promise<Buffer> { return await new Promise<Buffer>(resolve => fs.readFile(pass, (err, data) => resolve(data))) }
		/**
		 * fsの関数を非同期関数にしたものです。
		 * @param pass パスを入力します。
		 * @param data 書き込む文字列を入力します。
		 * @returns 
		 */
		export async function writeFile(pass: string, data: string): Promise<void> { return await new Promise<void>(resolve => fs.writeFile(pass, data, () => resolve())) }
		/**
		 * 半角と全角を区別し、それにあった文字列を算出します。
		 * 半角を1、全角を2文字とします。
		 * @param string 文字列を入力します。
		 * @returns 
		 */
	}
	/**
	 * 待機します。ライブラリでは使用しすぎないでください。IOや高負荷の回避におすすめです。
	 * @param time 時間を入力
	 */
	export async function wait(time: number) { await new Promise<void>(resolve => setTimeout(() => resolve(), time)) }
	export function textLength(string: string) {
		let length = 0
		for (let i = 0; i !== string.length; i++) string[i].match(/[ -~]/) ? length += 1 : length += 2
		return length
	}
	/**
	 * 配列をぐっちゃぐちゃにしたげます。にこっ
	 * @param array 配列を入力します。
	 * @returns 配列が出力されます。
	 */
	export function arrayRandom<T>(array: T[]): T[] {
		for (let i = 0; array.length !== i; i++) {
			const rm = Math.floor(Math.random() * i)
			let tmp = array[i]
			array[i] = array[rm]
			array[rm] = tmp
		}
		return array
	}
	/**
	 * 存在しない連想配列の初期化をし、undefinedを回避します。
	 * キー名が違う際に内型定義が変わる場合は利用しないでください。union型となってしまい、コードの記述がうまくいかなくなります。
	 * @param keyName キー名を入力します。
	 * @param datas キー名が入るとされる連想配列を入力します。
	 * @param set 初期化時に使用するデータを入力します。
	 * @returns 参照渡しがそのまま受け継がれたデータを出力します。
	 */
	const def = <T>(keyName: string, datas: Record<string, T | undefined>, set: T): T => {
		let value = datas[keyName];
		if (value === undefined) {
			value = set;
			datas[keyName] = value;
		}
		return value;
	};
	/**
	 * 有効なパスかをチェックします。そして、一部の特殊なパスの場合に変換をします
	 * @param string 文字列を入力します。
	 * @returns 
	 */
	export async function pathChecker(str: string | string[]) {
		const pass = await (async () => {
			const string = (() => {
				if (typeof str === "string") return str
				else return slashPathStr(str)
			})()
			const passDeli = (string.match(/:\\/)) ? "\\" : "/"
			const passArray = string.split(passDeli)
			let passtmp = ""
			for (let i = 0; i !== passArray.length; i++) passtmp += passArray[i] + (((i + 1) !== passArray.length) ? "/" : "")
			if (await sfs.exsits(passtmp)) return passtmp
			if (passtmp[0] === "\"" && passtmp[passtmp.length - 1] === "\"") passtmp = passtmp.substring(1, passtmp.length - 1)
			if (await sfs.exsits(passtmp)) return passtmp
			if (passtmp[0] === "\'" && passtmp[passtmp.length - 1] === "\'") passtmp = passtmp.substring(1, passtmp.length - 1)
			if (await sfs.exsits(passtmp)) return passtmp
			while (passtmp[passtmp.length - 1] === " ") passtmp = passtmp.slice(0, -1)
			if (await sfs.exsits(passtmp)) return passtmp
			const expType = " ()#~"
			for (let i = 0; i !== expType.length; i++) {
				const type = expType[i]
				const exp = new RegExp("\\\\\\" + type, "g")
				passtmp = passtmp.replace(exp, type)
				if (await sfs.exsits(passtmp)) return passtmp
			}
			return null
		})()
		if (!pass) return null
		const passArray = pass.split("/")
		return passArray
	}
	export function slashPathStr(passArray: string[]) {
		let passtmp = ""
		for (let i = 0; i !== passArray.length; i++) passtmp += passArray[i] + (((i + 1) !== passArray.length) ? "/" : "")
		return passtmp
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
	interface passInfo {
		/**
		 * 拡張子を含まないファイル名が記載
		 */
		filename: string
		/**
		 * 拡張子が記載
		 */
		extension: string
		/**
		 * この位置までのパスが記載
		 */
		pass: string
		/**
		 * 相対パスでの配列での記載
		 * フォルダ内のデータを移動する際に役立つ。
		 */
		point: string[]
		/**
		 * 元パスから配列での記載
		 * データにアクセスするために役立つ。passデータとはあまり変わらない。
		 */
		isPoint: string[]
	}
	export async function fileLister(
		/**
		 * フォルダパスを入力。その中のファイルやフォルダを配列化する。
		 */
		pass: string[],
		/**
		 * 様々なオプションを入力
		 */
		option?: {
			/**
			 * フォルダ内のフォルダにアクセス、階層内のデータを読み込むかどうか
			 */
			contain?: boolean,
			/**
			 * 拡張子を限定し、検索範囲を絞る
			 */
			extensionFilter?: string[],
			/**
			 * 「.」を使った隠しファイルを検出し、検索から除外する
			 */
			invFIleIgnored?: boolean,
			/**
			 * 「._」を使った隠しパラメーターファイルを検出し、検索から除外する
			 */
			macosInvIgnored?: boolean
		}
	) {
		//オプションデータの格納用
			/**
			 * フォルダ内のフォルダにアクセス、階層内のデータを読み込むかどうか
			 */
		let contain = false
		/**
		 * 拡張子を限定し、検索範囲を絞る
		 */
		let extensionFilter: string[] = []
		/**
		 * 「.」を使った隠しファイルを検出し、検索から除外する
		 */
		let invFIleIgnored = false
		/**
		 * 「._」を使った隠しパラメーターファイルを検出し、検索から除外する
		 */
		let macosInvIgnored = false
		if (option !== undefined) {
			if (option.contain) contain = true
			if (option.extensionFilter !== undefined) extensionFilter = option.extensionFilter
			if (option.invFIleIgnored) invFIleIgnored = true
			if (option.macosInvIgnored) macosInvIgnored = true
		}

		const processd: passInfo[] = [] //出力データの保存場所
		if (!await pathChecker(pass)) return processd
		const point: string[] = [] //パス場所を設定
		/**
		 * キャッシュデータの格納
		 */
		const filepoint: {
			/**
			 * マークとなるディレクトリのパスを入力
			 * @param lpass どこのパスかを記述する
			 */
			[lpass: string]: {
				/**
				 * キャッシュからファイルを指定する
				 */
				point: number,
				/**
				 * ディレクトリやファイルリストのキャッシュを保存
				 */
				dirents: fs.Dirent[]
			}
		} = {}

		while (true) {
			let lpass = pass //ファイル処理時の一時的パス場所
			for (let i = 0; i !== point.length; i++) lpass.push(point[i]) //パス解析、配列化

			//filepointの初期化
			if (!filepoint[slashPathStr(lpass)]) filepoint[slashPathStr(lpass)] = {
				point: 0,
				dirents: await new Promise(resolve => {
					fs.readdir(slashPathStr(lpass), { withFileTypes: true }, (err, dirents) => {
						if (err) throw err
						resolve(dirents)
					})
				})
			}
			/**
			 * 保存されたリストを取得
			 */
			const dirents = filepoint[slashPathStr(lpass)].dirents
			//もしディレクトリ内のファイル数とファイル指定番号が同じな場合
			if (dirents.length === filepoint[slashPathStr(lpass)].point)
				//lpassが初期値「pass + "/"」と同じ場合ループを抜ける
				if (slashPathStr(lpass) === slashPathStr(pass)) break
				//そうでない場合上の階層へ移動する
				else point.pop()
			else {
				//ファイル名の取得
				const name = dirents[filepoint[slashPathStr(lpass)].point].name
				//フォルダ、ディレクトリでない場合
				if (!dirents[filepoint[slashPathStr(lpass)].point].isDirectory()) {
					//ドットで分割
					const namedot = name.split(".")
					//拡張子を取得
					const extension = namedot[namedot.length - 1]
					if ((() => { //もしも
						if (extensionFilter[0]) { //拡張子指定がある場合
							let stats = false
							for (let i = 0; i !== extensionFilter.length; i++)
								if (extensionFilter[i].match(new RegExp(extension, "i"))) stats = true
							if (!stats) return false //拡張子がマッチしなかったらfalse
						}
						//末端が一致した場合false
						if (invFIleIgnored && name[0] === ".") return false
						if (macosInvIgnored && name[0] === "." && name[1] === "_") return false
						return true //全てがreturnしない場合true
					})()) processd.push({ //ファイルデータを追加
						filename: name.slice(0, -(extension.length + 1)),
						extension: extension,
						pass: slashPathStr(lpass),
						isPoint: JSON.parse(JSON.stringify([...pass, ...point])),
						point: point
					})
					//ディレクトりの場合は階層を移動し、ディレクトリ内に入り込む
				} else if (contain && dirents[filepoint[slashPathStr(lpass)].point].isDirectory()) point.push(name)
				//次のファイルへ移動する
				filepoint[slashPathStr(lpass)].point++
			}
		}
		//データを出力
		console.log(processd)
		return processd
	}
	export interface discordRealTimeData {
		name: string,
		client?: Discord.Client,
		status?: {
			logined?: boolean
		},
		program?: {
			[programName: string]: discordProgram
		}
	}
	interface discordBotEvents {
		classReady: [void]
		djsClientReady: [Discord.Client]
		messageCreate: [Discord.Message]
		interactionCreate: [Discord.Interaction]
		error: [Error]
	}
	export declare interface discordBot {
		on<K extends keyof discordBotEvents>(s: K, listener: (...args: discordBotEvents[K]) => any): this
		emit<K extends keyof discordBotEvents>(eventName: K, ...args: discordBotEvents[K]): boolean
	}
	interface discordData {
		[botName: string]: {
			programs?: string[],
			token?: string,
			clientOptions?: Discord.ClientOptions
		}
	}
	interface discordDataIOextJSON extends dataIO {
		json: discordData
	}
	interface discordProgram {
		message?: (message: Discord.Message) => Promise<void>,
		interaction?: (interaction: Discord.Interaction) => Promise<void>,
		slashCommand?: Omit<Discord.SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand" | "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">[]
	}
	export class discordBot extends EventEmitter {
		/**
		 * バッググラウンドで動作するために一時的に参照する固定の変数です。ここにVCや状態を書き込みます。
		 */
		rtdata: discordRealTimeData
		/**
		 * 保存するために入力します。
		 */
		data: discordDataIOextJSON
		/**
		 * @param data bot名のみを入れます。すると、class内で自動的にデータを読み込みます。
		 */
		constructor(data: discordRealTimeData) {
			super()
			this.rtdata = data
			if (!this.rtdata.status) this.rtdata.status = {}
			this.pconst().then(() => this.emit("classReady"))
		}
		static async initer(data: discordRealTimeData) {
			return await new Promise<discordBot>(resolve => {
				const djs = new discordBot(data)
				djs.on("classReady", () => resolve(djs))
			})
		}
		static async data() {
			const data = await dataIO.initer("discordBot")
			if (!data) return null
			const json: discordData = data.json

			return <discordData>JSON.parse(JSON.stringify(json))
		}
		private async pconst() {
			const { GatewayIntentBits, Partials } = Discord
			const newClientOption = {
				intents: [
					GatewayIntentBits.AutoModerationConfiguration,
					GatewayIntentBits.AutoModerationExecution,
					GatewayIntentBits.DirectMessageReactions,
					GatewayIntentBits.DirectMessageTyping,
					GatewayIntentBits.DirectMessages,
					GatewayIntentBits.GuildEmojisAndStickers,
					GatewayIntentBits.GuildIntegrations,
					GatewayIntentBits.GuildInvites,
					GatewayIntentBits.GuildMembers,
					GatewayIntentBits.GuildMessageReactions,
					GatewayIntentBits.GuildMessageTyping,
					GatewayIntentBits.GuildMessages,
					GatewayIntentBits.GuildPresences,
					GatewayIntentBits.GuildScheduledEvents,
					GatewayIntentBits.GuildVoiceStates,
					GatewayIntentBits.GuildWebhooks,
					GatewayIntentBits.Guilds,
					GatewayIntentBits.MessageContent
				],
				partials: [
					Partials.Channel,
					Partials.GuildMember,
					Partials.GuildScheduledEvent,
					Partials.Message,
					Partials.Reaction,
					Partials.ThreadMember,
					Partials.User
				]
			}
			const data = await dataIO.initer("discordBot")
			if (!data) {
				const e = new ReferenceError()
				e.message = "dataIOの準備ができませんでした。"
				e.name = "Discord Bot"
				this.emit("error", e)
				return
			}
			this.data = data
			if (!this.data.json[this.rtdata.name]) this.data.json[this.rtdata.name] = {}
			if (!this.rtdata.client) {
				const json = this.data.json[this.rtdata.name]
				this.rtdata.client = new Discord.Client(json.clientOptions !== undefined ? json.clientOptions : newClientOption)
				const client = this.rtdata.client
				client.on(Discord.Events.MessageCreate, async message => {
					if (this.rtdata.program) {
						const programStrings = Object.keys(this.rtdata.program)
						for (let i = 0; i !== programStrings.length; i++) {
							const program = this.rtdata.program[programStrings[i]]
							if (program.message) await program.message(message)
						}
					}
				})
				client.on(Discord.Events.InteractionCreate, async interaction => {
					if (this.rtdata.program) {
						const programStrings = Object.keys(this.rtdata.program)
						for (let i = 0; i !== programStrings.length; i++) {
							const program = this.rtdata.program[programStrings[i]]
							if (program.interaction) await program.interaction(interaction)
						}
					}
				})
			}
			const client = this.rtdata.client
			client.on(Discord.Events.ClientReady, client => {
				this.emit("djsClientReady", client)
			})
			client.on(Discord.Events.MessageCreate, message => {
				this.emit("messageCreate", message)
			})
			client.on(Discord.Events.InteractionCreate, interaction => {
				this.emit("interactionCreate", interaction)
			})
			await this.data.save()
			await this.programSeting()
		}

		private programs: {
			[programName: string]: discordProgram
		} = {
				"簡易認証": {
					interaction: async interaction => {
						interface ttts {
							buttoncreate: {
								roleId: string
								question: boolean
							}
							calc: {
								roleId: string
								buttonNum: number
								calcType: number
							}
						};
						type ttt = {
							type: "buttoncreate",
							data: {
								roleId: string,
								question: boolean
							}
						} | {
							type: "calc",
							data: {
								roleId: string,
								buttonNum: number,
								calcType: number
							}
						};
						if (interaction.isChatInputCommand()) {
							if (interaction.channel && interaction.channel.isTextBased() && !interaction.channel.isVoiceBased() && !interaction.channel.isThread() && !interaction.channel.isDMBased() && interaction.guild) {
								const name = interaction.commandName
								if (name === "buttoncreate") {
									const member = (await interaction.guild.members.fetch()).get(interaction.user.id)
									if (member && member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
										const role = interaction.options.getRole("roles")
										const question = interaction.options.getBoolean("question")
										const title = interaction.options.getString("title")
										const description = interaction.options.getString("description")
										if (role === null || question === null) {
											interaction.channel.send("必要なデータが不足または破損してしまっているようです。最初からやり直してください。")
											return
										}
										const data: ttt = {
											type: "buttoncreate",
											data: {
												roleId: role.id,
												question: question
											}
										}
										const components = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
											.addComponents(
												new Discord.ButtonBuilder()
													.setLabel("認証！")
													.setStyle(Discord.ButtonStyle.Primary)
													.setCustomId(JSON.stringify(data))
											)
										const iconURL = interaction.guild.iconURL()
										const embed = new Discord.EmbedBuilder()
											.setTitle(title || "認証をして僕たちとこのサーバーを楽しもう！")
											.setDescription(description || "✅認証は下のボタンを押下する必要があります。")
											.setAuthor({
												name: interaction.guild.name,
												iconURL: iconURL ? iconURL : undefined
											})
										try {
											await interaction.channel.send({ embeds: [embed], components: [components] })
											await interaction.reply({ content: "作成が完了しました！", ephemeral: true })
										} catch (e) {
											interaction.reply({
												content: "エラーが確認されました。: `" + e.code + "/" + e.message,
												ephemeral: true
											})
										}
									} else {
										await interaction.reply({ content: "コマンド発行者自身に管理者権限がないため、実行することが出来ません..." })
									}
								}
							}
						}
						if (interaction.isButton()) {
							const customId = interaction.customId
							const data = ((): ttt | null => {
								try { return JSON.parse(customId) }
								catch (e) { return null } //JSONではない文字列の場合nullを返す
							})()
							let roleGive: { give: boolean, roleId: string | null } = {
								give: false,
								roleId: null
							}
							if (data !== null)
								if (data.type === "buttoncreate") {
									const { roleId, question } = data.data
									if (question) {
										const embed = new Discord.EmbedBuilder();
										const num: number[] = []
										for (let i = 0; i !== 2; i++) num.push(Math.floor(Math.random() * 9))
										const ord: { type: string, Num: number }[] = []
										ord.push({ type: "+", Num: num[0] + num[1] })
										ord.push({ type: "-", Num: num[0] - num[1] })
										ord.push({ type: "x", Num: num[0] * num[1] })
										const answer = Math.floor(Math.random() * ord.length - 1)
										for (let i = 0; i !== ord.length - 1; i++) {
											const random = Math.floor(Math.random() * i)
											const tmp = ord[i]
											ord[i] = ord[random]
											ord[random] = tmp
										}
										embed.setTitle("問題！")
										embed.setDescription("下の計算を解くだけで認証が出来ます！")
										embed.addFields({
											name: num[0] + ord[answer].type + num[1] + "=",
											value: "の答えを下から選びましょう。"
										})
										const components = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
										for (let i = 0; ord.length != i; i++) {
											const data: ttt = {
												type: "calc",
												data: {
													roleId: roleId,
													buttonNum: i,
													calcType: answer
												}
											}
											components.addComponents(
												new Discord.ButtonBuilder()
													.setLabel(String(ord[i].Num))
													.setStyle(Discord.ButtonStyle.Primary)
													.setCustomId(JSON.stringify(data))
											)
										}
										interaction.reply({
											embeds: [embed],
											components: [components],
											ephemeral: true
										})
									} else roleGive = { give: true, roleId: roleId }
								} else if (data.type === "calc") {
									const { roleId, buttonNum, calcType } = data.data
									if (buttonNum === calcType) roleGive = { give: true, roleId: roleId }
									else interaction.reply({
										content: "あぁ...答えが違いますよ...\nもっかいクリックしてやりなおしましょ！",
										ephemeral: true
									})
								}
							if (roleGive.give && roleGive.roleId !== null && interaction.channel) {
								try {
									if (interaction.guild) {
										const member = interaction.guild.members.cache.get(interaction.user.id)
										const role = await interaction.guild.roles.fetch(roleGive.roleId)
										if (member && role) member.roles.add(role)
									} else {
										interaction.reply({
											content: "",
											ephemeral: true
										})
									}
								}
								catch (e) {
									if (e.code) {
										interaction.reply({
											content: "エラー確認: " + e.code + "\nこのエラーコードを管理人に報告してくれると、一時的に対処が行われます。",
											ephemeral: true
										})
									} else {
										interaction.reply({
											content: "認証でエラーが発生してしまいました...\nエラーは管理者が確認し修正します。",
											ephemeral: true
										})
									}
								}
							}
						}
					},
					slashCommand: [
						new Discord.SlashCommandBuilder()
							.setName("buttoncreate")
							.setDescription("認証ボタンを作成します。")
							.addRoleOption(option => option
								.setName("roles")
								.setDescription("付与する際に使用するロールを選択します。")
								.setRequired(true)
							)
							.addBooleanOption(option => option
								.setName("question")
								.setDescription("認証をクリックした際に、計算問題を出すかどうかを決めます(通常は有効)")
							)
							.addStringOption(option => option
								.setName("title")
								.setDescription("埋め込みのタイトルを決めます。")
							)
							.addStringOption(option => option
								.setName("description")
								.setDescription("埋め込みの説明を決めます。")
							),
						new Discord.SlashCommandBuilder()
							.setName("multirolebtn")
							.setDescription("複数役職を付与したい場合に使用します。")
							.addStringOption(option => option
								.setName("roleids")
								.setDescription("ロールIDをスペースで区切り、それを使用し複数ロールの付与をします。")
								.setRequired(true)
							)
							.addStringOption(option => option
								.setName("title")
								.setDescription("埋め込みのタイトルを決めます。")
							)
							.addStringOption(option => option
								.setName("description")
								.setDescription("埋め込みの説明を決めます。")
							)
					]
				}
			}

		async token(token: string) {
			this.data.json[this.rtdata.name].token = token
			await this.data.save()
		}
		private async programSeting() {
			const progs = this.data.json[this.rtdata.name].programs
			if (progs)
				for (let i = 0; i !== progs.length; i++) {
					if (this.rtdata.program && !this.rtdata.program[progs[i]]) {
						this.rtdata.program[progs[i]] = this.programs[progs[i]]
					}
				}
		}
		async login() {
			if (!this.rtdata.status) return
			if (!this.rtdata.client) return
			const token = this.data.json[this.rtdata.name].token
			if (!token) return
			this.rtdata.status.logined = true
			await this.rtdata.client.login(token)
		}
	}
	interface sharpConvertEvents {
		end: [void],
		progress: [now: number, total: number],
		error: [Error]
	}
	export declare interface sharpConvert {
		on<K extends keyof sharpConvertEvents>(s: K, listener: (...args: sharpConvertEvents[K]) => any): this
		emit<K extends keyof sharpConvertEvents>(eventName: K, ...args: sharpConvertEvents[K]): boolean
	}
	export class sharpConvert extends EventEmitter {
		#converting = 0
		#convertPoint = 0
		afterPass = ""
		size = 100
		processd: {
			filename: string,
			extension: string,
			point: string[],
			pass: string
		}[] = []
		nameing = 1
		type: 0 | 1 = 0
		#maxconvert = 20
		#interval: NodeJS.Timer
		constructor() {
			super()
			this.#interval = setInterval(() => this.emit("progress", this.#convertPoint, this.processd.length), 100)
		}
		async convert() {
			await new Promise<void>(resolve => {
				const convert = async () => {
					if (this.#converting === this.#maxconvert) return
					if (this.#convertPoint === this.processd.length) {
						if (this.#converting === 0) {
							this.emit("end", undefined)
							resolve()
						}
						clearInterval(this.#interval)
						clearInterval(loopInterval)
						return
					}
					const i = this.#convertPoint
					this.#convertPoint++
					this.#converting++
					const fileName = this.processd[i].filename + "." + this.processd[i].extension
					let outfolders = ""
					const point = this.processd[i].point
					for (let i = 0; i !== point.length; i++) {
						outfolders += point[i] + "/"
						if (!(await sfs.exsits(this.afterPass + "/" + outfolders))) await sfs.mkdir(this.afterPass + "/" + outfolders)
					}
					const Stream = fs.createWriteStream(this.afterPass + "/" + outfolders + [
						this.processd[i].filename,
						(i + 1) + " - " + this.processd[i].filename,
						this.processd[i].extension + " - " + this.processd[i].filename,
						(i + 1) + "_" + this.processd[i].extension + " - " + this.processd[i].filename,
						i + 1,
					][this.nameing] + "." + sharpConvert.extType[this.type])
					this.emit("progress", this.#convertPoint, this.processd.length)
					await new Promise<void>(async resolve => {
						try {
							const image = imageSize(this.processd[i].pass + fileName)
							if (image.width) {
								const sha = sharp(this.processd[i].pass + fileName)
								sha.resize((this.size < image.width) ? this.size : image.width)
								switch (sharpConvert.extType[this.type]) {
									case "png": sha.png(); break
									case "jpg": sha.jpeg(); break
								}
								sha.pipe(Stream)
								Stream.on("finish", resolve)
							} else {
								const e = new ReferenceError()
								e.message = "width is undefined."
								e.name = "imageSize"
								this.emit("error", e)
								resolve()
							}
						} catch (e) {
							this.emit("error", e)
							resolve()
						}
					})
					this.#converting--
					convert()
				}
				const loopInterval = setInterval(convert, 100)
			})
		}
		/**
		 * 命名タイプを設定。これに反ってプログラムを作ること。
		 */
		static type: string[] = [
			"[ファイル名].png",
			"[連番] - [ファイル名].png",
			"[元拡張子] - [ファイル名].png",
			"[連番]_[元拡張子] - [ファイル名].png",
			"[連番].png"
		]
		static extType = ["png", "jpg"]
	}
	export interface ffmpegConverterEvents {
		end: [void]
		progress: [any]
		error: [Error]
	}
	export declare interface ffmpegConverter {
		on<K extends keyof ffmpegConverterEvents>(s: K, listener: (...args: ffmpegConverterEvents[K]) => any): this
		emit<K extends keyof ffmpegConverterEvents>(eventName: K, ...args: ffmpegConverterEvents[K]): boolean
	}
	export class ffmpegConverter extends EventEmitter {
		#ffmpeg: ffmpeg.FfmpegCommand
		constructor(pass: string) {
			super()
			this.#ffmpeg = ffmpeg(pass)
		}
		preset: string[]
		async convert(savePass: string) {
			await new Promise<void>(resolve => {
				this.#ffmpeg.addOptions(this.preset)
				this.#ffmpeg.save(savePass)
				this.#ffmpeg.on("end", () => {
					resolve()
					this.emit("end", undefined)
				})
				this.#ffmpeg.on("progress", progress => {
					console.log(progress)
					this.emit("progress", progress)
				})
				this.#ffmpeg.on("error", err => {
					console.log(err)
				})
			})
		}
		addInput(pass: string) {
			this.#ffmpeg.addInput(pass)
		}
		static async inputPreset(option?: { tagonly?: boolean }): Promise<{ name: string | null, ext: string, tag: string[] }> {
			console.log("-からタグの入力を始めます。複数を１度に入力してはなりません。検知し警告します。\n空白で続行すると完了したことになります。")
			const presets: string[] = []
			while (true) {
				const string = await question("タグを入力してください。(" + presets.length + "個が登録済み)")
				if (string === "") if (presets.length !== 0) break
				else {
					if (await booleanIO("タグが１つも登録されていません。このままで予想外の動作をする可能性がありますがよろしいですか？")) break
					else continue
				}
				if (string[0] !== "-" && !(await booleanIO("最初にハイフンがありません。今後エラーになる恐れがありますが、よろしいですか？"))) continue
				if (string.split("-").length > 2 && !(await booleanIO("ハイフンを２つ以上検知しました。今後エラーになる可能性が否めませんが、よろしいですか？"))) continue
				presets.push(string)
			}
			const extension = await question("保存時に使用する拡張子を入力してください。間違えると今後エラーを起こします。")
			const name = (option ? option.tagonly : false) ? null : await question("プリセット名を入力してください。名前は自由です。")
			return {
				name: name,
				ext: extension,
				tag: presets
			}
		}
	}
	export function kanaConvert(string: string, convertTo: boolean) {
		const array = [
			{
				"key": " ",
				"kana": " "
			},
			{
				"key": " ",
				"kana": "　"
			},
			{
				"key": "1",
				"kana": "ぬ"
			},
			{
				"key": "2",
				"kana": "ふ"
			},
			{
				"key": "3",
				"kana": "あ"
			},
			{
				"key": "4",
				"kana": "う"
			},
			{
				"key": "5",
				"kana": "え"
			},
			{
				"key": "6",
				"kana": "お"
			},
			{
				"key": "7",
				"kana": "や"
			},
			{
				"key": "8",
				"kana": "ゆ"
			},
			{
				"key": "9",
				"kana": "よ"
			},
			{
				"key": "0",
				"kana": "わ"
			},
			{
				"key": "-",
				"kana": "ほ"
			},
			{
				"key": "^",
				"kana": "へ"
			},
			{
				"key": "¥",
				"kana": "ー"
			},
			{
				"key": "q",
				"kana": "た"
			},
			{
				"key": "w",
				"kana": "て"
			},
			{
				"key": "e",
				"kana": "い"
			},
			{
				"key": "r",
				"kana": "す"
			},
			{
				"key": "t",
				"kana": "か"
			},
			{
				"key": "y",
				"kana": "ん"
			},
			{
				"key": "u",
				"kana": "な"
			},
			{
				"key": "i",
				"kana": "に"
			},
			{
				"key": "o",
				"kana": "ら"
			},
			{
				"key": "p",
				"kana": "せ"
			},
			{
				"key": "@",
				"kana": "゛"
			},
			{
				"key": "[",
				"kana": "゜"
			},
			{
				"key": "a",
				"kana": "ち"
			},
			{
				"key": "s",
				"kana": "と"
			},
			{
				"key": "d",
				"kana": "し"
			},
			{
				"key": "f",
				"kana": "は"
			},
			{
				"key": "g",
				"kana": "き"
			},
			{
				"key": "h",
				"kana": "く"
			},
			{
				"key": "j",
				"kana": "ま"
			},
			{
				"key": "k",
				"kana": "の"
			},
			{
				"key": "l",
				"kana": "り"
			},
			{
				"key": ";",
				"kana": "れ"
			},
			{
				"key": ":",
				"kana": "け"
			},
			{
				"key": "]",
				"kana": "む"
			},
			{
				"key": "z",
				"kana": "つ"
			},
			{
				"key": "x",
				"kana": "さ"
			},
			{
				"key": "c",
				"kana": "そ"
			},
			{
				"key": "v",
				"kana": "ひ"
			},
			{
				"key": "b",
				"kana": "こ"
			},
			{
				"key": "n",
				"kana": "み"
			},
			{
				"key": "m",
				"kana": "も"
			},
			{
				"key": ",",
				"kana": "ね"
			},
			{
				"key": ".",
				"kana": "る"
			},
			{
				"key": "/",
				"kana": "め"
			},
			{
				"key": "_",
				"kana": "ろ"
			},
			{
				"key": "!",
				"kana": "ぬ"
			},
			{
				"key": "\"",
				"kana": "ふ"
			},
			{
				"key": "#",
				"kana": "ぁ"
			},
			{
				"key": "$",
				"kana": "ぅ"
			},
			{
				"key": "%",
				"kana": "ぇ"
			},
			{
				"key": "&",
				"kana": "ぉ"
			},
			{
				"key": "'",
				"kana": "ゃ"
			},
			{
				"key": "(",
				"kana": "ゅ"
			},
			{
				"key": ")",
				"kana": "ょ"
			},
			{
				"key": "0",
				"kana": "を"
			},
			{
				"key": "=",
				"kana": "ほ"
			},
			{
				"key": "~",
				"kana": "へ"
			},
			{
				"key": "|",
				"kana": "ー"
			},
			{
				"key": "Q",
				"kana": "た"
			},
			{
				"key": "W",
				"kana": "て"
			},
			{
				"key": "E",
				"kana": "ぃ"
			},
			{
				"key": "R",
				"kana": "す"
			},
			{
				"key": "T",
				"kana": "か"
			},
			{
				"key": "Y",
				"kana": "ん"
			},
			{
				"key": "U",
				"kana": "な"
			},
			{
				"key": "I",
				"kana": "に"
			},
			{
				"key": "O",
				"kana": "ら"
			},
			{
				"key": "P",
				"kana": "せ"
			},
			{
				"key": "`",
				"kana": "゛"
			},
			{
				"key": "{",
				"kana": "「"
			},
			{
				"key": "A",
				"kana": "ち"
			},
			{
				"key": "S",
				"kana": "と"
			},
			{
				"key": "D",
				"kana": "し"
			},
			{
				"key": "F",
				"kana": "は"
			},
			{
				"key": "G",
				"kana": "き"
			},
			{
				"key": "H",
				"kana": "く"
			},
			{
				"key": "J",
				"kana": "ま"
			},
			{
				"key": "K",
				"kana": "の"
			},
			{
				"key": "L",
				"kana": "り"
			},
			{
				"key": "+",
				"kana": "れ"
			},
			{
				"key": "*",
				"kana": "け"
			},
			{
				"key": "}",
				"kana": "」"
			},
			{
				"key": "Z",
				"kana": "っ"
			},
			{
				"key": "X",
				"kana": "さ"
			},
			{
				"key": "C",
				"kana": "そ"
			},
			{
				"key": "V",
				"kana": "ひ"
			},
			{
				"key": "B",
				"kana": "こ"
			},
			{
				"key": "N",
				"kana": "み"
			},
			{
				"key": "M",
				"kana": "も"
			},
			{
				"key": "<",
				"kana": "、"
			},
			{
				"key": ">",
				"kana": "。"
			},
			{
				"key": "?",
				"kana": "・"
			},
			{
				"key": "_",
				"kana": "ろ"
			}
		]
		const type = convertTo ? 1 : 0

		let outText = ""
		for (let i = 0; i !== string.length; i++) {
			const e = (() => {
				for (let e = 0; e !== array.length; e++)
					if (string[i] === array[e][((type === 1) ? "key" : "kana")]) return e
				return null
			})()
			if (e !== null) outText += array[e][((type === 1) ? "kana" : "key")]
			else outText += string[i]
		}
		return outText
	}
	interface bouyomiStatus {
		speed?: number
		tone?: number
		volume?: number
		voice?: number
		address?: string
		port?: number
	}
	interface BouyomiEvents {
		ready: [void],
		error: [Error],
		end: [void]
	}
	export declare interface Bouyomi {
		on<K extends keyof BouyomiEvents>(s: K, listener: (...args: BouyomiEvents[K]) => any): this
		emit<K extends keyof BouyomiEvents>(eventName: K, ...args: BouyomiEvents[K]): boolean
	}
	export class Bouyomi extends EventEmitter {
		#client: net.Socket
		#data: { speed: number, tone: number, volume: number, voice: number, port: number, url: string, code: BufferEncoding } = {
			speed: -1,
			tone: -1,
			volume: -1,
			voice: 0,
			port: 50001,
			url: "localhost",
			code: "utf8"
		}
		constructor(data: { speed?: number, tone?: number, volume?: number, voice?: number, port?: number, address?: string, ccode?: BufferEncoding }) {
			super()
			this.speed = data.speed ? data.speed : -1
			this.tone = data.tone ? data.tone : -1
			this.volume = data.volume ? data.volume : -1
			this.voice = data.voice ? data.voice : 0
			this.port = data.port ? data.port : 50001
			this.address = data.address ? data.address : "localhost"
			this.ccode = data.ccode ? data.ccode : "utf8"
			this.#client = new net.Socket()
			const client = this.#client
			client.on("ready", () => this.emit("ready", undefined))
			client.on("error", e => this.emit("error", e))
			client.on("end", () => this.emit("end", undefined))
		}
		set speed(d) {
			d = (d > 200) ? 200 : d
			d = (d < -1) ? -1 : d
			this.#data.speed = d
		}
		get speed() { return this.#data.speed }
		set tone(d) {
			d = (d > 200) ? 200 : d
			d = (d < -1) ? -1 : d
			this.#data.tone = d
		}
		get tone() { return this.#data.tone }
		set volume(d) {
			d = (d > 100) ? 100 : d
			d = (d < -1) ? -1 : d
			this.#data.volume = d
		}
		get volume() { return this.#data.volume }
		set voice(d) {
			d = (d < 0) ? 0 : d
			this.#data.voice = d
		}
		get voice() { return this.#data.voice }
		set port(d) {
			d = (d > 65535) ? 65535 : d
			d = (d < 0) ? 0 : d
			this.#data.port = d
		}
		get port() { return this.#data.port }
		set address(d) { this.#data.url = d }
		get address() { return this.#data.url }
		set ccode(d) { this.#data.code = d }
		get ccode() { return this.#data.code }
		send(msg: string) {
			const client = this.#client
			client.connect(this.#data.port, this.#data.url)
			const Command = Buffer.alloc(2)
			Command.writeInt16LE(1, 0)
			client.write(Command)
			const Speed = Buffer.alloc(2)
			Speed.writeInt16LE(this.#data.speed, 0)
			client.write(Speed)
			const Tone = Buffer.alloc(2)
			Tone.writeInt16LE(this.#data.tone, 0)
			client.write(Tone)
			const Volume = Buffer.alloc(2)
			Volume.writeInt16LE(this.#data.volume, 0)
			client.write(Volume)
			const Voice = Buffer.alloc(2)
			Voice.writeInt16LE(this.#data.voice, 0)
			client.write(Voice)
			const Code = Buffer.alloc(1)
			Code.writeInt8(0, 0)
			client.write(Code)
			const Message = Buffer.from(msg, this.#data.code)
			const Length = Buffer.alloc(4)
			Length.writeInt32LE(Message.length, 0)
			client.write(Length)
			client.write(Message)
			client.end()
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
		 * メインのnow:2,total:4だとして、このエリアでのnow:3,total:6はnow:2.5,total:4となります。
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
			const length = textLength(oneDisplay) + textLength(twoDisplay)
			const progressLength = windowSize[0] - 3 - length
			const displayProgress = Number((((percent ? percent : 0) + ((miniPercent ? miniPercent : 0) / this.total)) * progressLength).toFixed())
			for (let i = 0; i < displayProgress; i++) progress += "#"
			for (let i = 0; i < progressLength - (displayProgress); i++) progress += " "
			const display = oneDisplay + progress + twoDisplay
			readline.cursorTo(process.stdout, 0)
			process.stdout.clearLine(0)
			process.stdout.write(display)
			await wait(this.interval)
			this.#view()
		}
	}
	interface dataiofiles {
		[fileName: string]: dataiofile
	}
	interface dataiofile {
		attribute: {
			directory: boolean
		}
		data: dataiofiles,
		pass: string | null,
		smalldata?: {}
	}
	interface dataIOEvents { ready: [void] }
	export declare interface dataIO {
		on<K extends keyof dataIOEvents>(s: K, listener: (...args: dataIOEvents[K]) => any): this
		emit<K extends keyof dataIOEvents>(eventName: K, ...args: dataIOEvents[K]): boolean
	}
	export class dataIO extends EventEmitter {
		#operation = false
		#pass: string[]
		#name: string
		#jsonPass: string
		#folderPass: string
		json: any
		#passIndex: dataiofiles
		constructor(pass: string, programName: string) {
			super()
			pathChecker(pass).then(async data => {
				if (data) this.#pass = data
				else throw new Error("パスが間違っています。")
				if (programName === "dataIO") throw new Error("dataIOを利用することは出来ません")
				this.#name = programName
				const path = slashPathStr(this.#pass)
				if (!await sfs.exsits(path + "/dataIO.json")) await sfs.writeFile(path + "/dataIO.json", "[]")
				const dataIOIndex: { [programName: string]: any } = JSON.parse(String(await sfs.readFile(path + "/dataIO.json")))
				if (!dataIOIndex[programName]) dataIOIndex[programName] = true
				await sfs.writeFile(path + "/dataIO.json", JSON.stringify(dataIOIndex))
				this.#jsonPass = path + "/" + this.#name + ".json"
				this.#folderPass = path + "/" + this.#name
				const initValue = JSON.stringify({ json: {}, passIndex: {} })
				if (!await sfs.exsits(this.#jsonPass)) await sfs.writeFile(this.#jsonPass, initValue)
				if (!await sfs.exsits(this.#folderPass)) await sfs.mkdir(this.#folderPass)
				const rawJSON: {
					json: {},
					passIndex: dataiofiles
				} = await JSON.parse(String(await sfs.readFile(this.#jsonPass)))
				this.json = rawJSON.json
				this.#passIndex = rawJSON.passIndex
				this.#operation = true
				this.emit("ready", undefined)
			})
		}
		static async initer(programName: string): Promise<dataIO | null> {
			if (programName === "dataIO") {
				console.log("クラス名と同じ名前を使用しないでください。\nこの名前は内部で予約されています。")
				return null
			}
			if (!await sfs.exsits("passCache.json")) {
				console.log("passCache.jsonが存在しないため、プログラムを続行することが出来ません。\n設定を行ってください。")
				return null
			}
			const io = new dataIO(JSON.parse(String(await sfs.readFile("passCache.json"))), programName)
			await new Promise<void>(resolve => io.on("ready", () => resolve()))
			return io
		}
		get operation() { return this.#operation }
		async passGet(pass: string[], name: string, option?: { extension?: string }): Promise<string | null> {
			if (!this.#operation) return null
			let extension: string | null = null
			if (option) {
				if (option.extension) extension = option.extension
			}
			let obj: dataiofiles = this.#passIndex
			for (let i = 0; i !== pass.length; i++) {
				if (!obj[pass[i]]) obj[pass[i]] = {
					attribute: { directory: true },
					pass: null,
					data: {}
				}
				if (obj[pass[i]].attribute.directory) obj = obj[pass[i]].data
				else {
					const error = new Error()
					error.message = "JSONによる擬似パス内階層にアクセス中に例外「ファイル内フォルダにアクセス」が発生しました。"
					error.name = "JSON擬似パスエラー"
					throw error
				}
			}
			if (!obj[name]) obj[name] = {
				attribute: { directory: false },
				pass: this.#folderPass + "/" + name + "-" + Date.now() + "-" + pass.join("") + "-" + Math.floor(Math.random() * 99) + (extension ? "." + extension : ""),
				data: {}
			}
			return obj[name].pass
		}
		async save() {
			await sfs.writeFile(this.#jsonPass, JSON.stringify({ json: this.json, passIndex: this.#passIndex }))
		}
	}
	interface youtubeDownloaderEvents {
		ready: [void]
		error: [Error]
	}
	interface ytdldataIOextJSON extends dataIO {
		json: {
			progress?: {
				[videoId: string]: {
					status: "download" | "downloaded",
					startTime: number,
					chunkLength: number,
					downloaded: number,
					total: number
				}
			},
			videoMeta?: {
				[videoId: string]: {
					[codec: string]: {
						[height: number]: {
							[fps: number]: {}
						}
					}
				}
			},
			codecType?: {
				[codecName: string]: boolean
			}
		}
	}
	export declare interface youtubeDownloader {
		on<K extends keyof youtubeDownloaderEvents>(s: K, listener: (...args: youtubeDownloaderEvents[K]) => any): this
		emit<K extends keyof youtubeDownloaderEvents>(eventName: K, ...args: youtubeDownloaderEvents[K]): boolean
	}
	export class youtubeDownloader extends EventEmitter {
		data: ytdldataIOextJSON | undefined
		constructor() {
			super()
			this.pconst().then(() => this.emit("ready", undefined))
		}
		private async pconst() {
			const data = await dataIO.initer("youtube-downloader")
			if (!data) {
				const e = new ReferenceError()
				e.message = "dataIOの準備ができませんでした。"
				e.name = "YouTube Downloader"
				this.emit("error", e)
			}
		}
		async videoDataGet(videoId: string, type: "videoonly" | "audioonly") {
			if (!this.data) return
			const youtubedl = ytdl(videoId, { filter: type, quality: "highest" })
			const pass = await this.data.passGet(["youtubeSource", "temp", videoId], type)
			if (!pass) return
			const Stream = fs.createWriteStream(pass)
			youtubedl.pipe(Stream)
			youtubedl.on("progress", (chunkLength, downloaded, total) => {
				if (!this.data) return
				if (!this.data.json.progress) this.data.json.progress = {}
				const progress = this.data.json.progress[videoId]
				progress.chunkLength = chunkLength
				progress.downloaded = downloaded
				progress.total = total
				progress.status = "download"
				progress.startTime = progress.startTime ? progress.startTime : Date.now()
			})
			youtubedl.on("end", async () => {
				if (!this.data) return
				if (!this.data.json.progress) this.data.json.progress = {}
				this.data.json.progress[videoId].status = "downloaded"
				async function ffprobe(pass: string): Promise<ffmpeg.FfprobeData> {
					return await new Promise(resolve => {
						ffmpeg(pass).ffprobe((err, data) => { resolve(data) })
					})
				}
				const data = await ffprobe(pass)
				const video = data.streams[0]
				const fps = (() => {
					if (!video.r_frame_rate) return null
					if (video.r_frame_rate.match("/")) { //もしfps値が「0」または「0/0」だった場合に自動で計算する関数
						const data = video.r_frame_rate.split("/")
						return Number(data[0]) / Number(data[1])
					} else return Number(video.r_frame_rate)
				})()
				if (!this.data.json.videoMeta) this.data.json.videoMeta = {}
				if (!video.codec_name) return
				if (!video.height) return
				if (!fps) return
				Object.assign(this.data.json.videoMeta, {
					[videoId]: {
						[video.codec_name]: {
							[video.height]: {
								[fps]: {}
							}
						}
					}
				})
				//これしか重複せず高速で、プログラムが入手したコーデック一覧を作る方法がわからない
				if (!this.data.json.codecType) this.data.json.codecType = {}
				this.data.json.codecType[video.codec_name] = true
			})
		}
	}
	/**
	 * 動画や音声をスムーズにクライアントに送信する関数です
	 * @param videopath パスを入力します
	 * @param range リクエストのレンジを入力します
	 * @param type Content-Typeに使用します
	 * @param res response変数を入力します
	 */
	async function VASourceGet(videopath: string, range: string, type: string, res: any) {
		const videoSize = fs.statSync(videopath).size //ファイルサイズ(byte)
		const chunkSize = 1 * 1e7 //チャンクサイズ

		const ranges = String(range).split("-")
		if (ranges[0]) ranges[0] = ranges[0].replace(/\D/g, "")
		if (ranges[1]) ranges[1] = ranges[1].replace(/\D/g, "")
		//これは取得するデータ範囲を決定します。
		const options = { start: 0, end: 0 }
		options.start = Number(ranges[0]) //始まりの指定
		options.end = Number(ranges[1]) || Math.min(options.start + chunkSize, videoSize - 1) //終わりの指定
		if (!range) options.end = videoSize - 1

		const headers: {
			[name: string]: string
		} = {} //ヘッダー
		headers["Accept-Ranges"] = "bytes"
		headers["Content-Length"] = String(videoSize)
		if (range) headers["Content-Length"] = String(options.end - options.start + 1)
		if (range) headers["Content-Range"] = "bytes " + options.start + "-" + options.end + "/" + videoSize
		headers["Content-Range"] = "bytes " + options.start + "-" + options.end + "/" + videoSize
		headers["Content-Type"] = type
		console.log(options, ranges, range)
		res.writeHead((range) ? 206 : 200, headers) //206を使用すると接続を続行することが出来る
		const Stream = fs.createReadStream(videopath, options) //ストリームにし、範囲のデータを読み込む
		Stream.on("error", error => {
			console.log("Error reading file" + videopath + ".")
			console.log(error)
			res.sendStatus(500)
		});
		Stream.on("data", c => res.write(c))
		Stream.on("end", () => res.end())
	}
	export async function cuiIO(shareData: {
		discordBot?: {
			[botName: string]: discordRealTimeData
		}
	}) {
		const cuiIOtmp: {} = {}
		const programs: {
			name: string,
			function: () => Promise<void>
		}[] = [
				{
					name: "Image Resize",
					function: async () => {
						const imageSize = Number(await question("指定の画像サイズを入力してください。"))
						if (Number.isNaN(imageSize)) {
							console.log("入力が間違っているようです。最初からやり直してください。")
							return
						}
						const beforePass = await pathChecker(await question("変換元の画像フォルダを指定してください。"))
						if (beforePass === null) {
							console.log("入力が間違っているようです。最初からやり直してください。")
							return
						}
						const afterPass = await pathChecker(await question("変換先のフォルダを指定してください。(空フォルダ推奨)"))
						if (afterPass === null) {
							console.log("入力が間違っているようです。最初からやり直してください。")
							return
						}
						const nameing = await choice(sharpConvert.type, "命名方法", "上記から命名方法を選択してください。")
						if (nameing === null) {
							console.log("入力が間違っているようです。最初からやり直してください。")
							return
						}
						const type = await choice(sharpConvert.extType, "拡張子一覧", "利用する拡張子と圧縮技術を選択してください。")
						if (type === null) {
							console.log("入力が間違っているようです。最初からやり直してください。")
							return
						}
						if (type !== 1 && type !== 2) {
							console.log("プログラム内で予期せぬエラーを回避するため、中断されました。")
							return
						}
						const folderContain = await booleanIO("フォルダ内にあるフォルダも画像変換に含めますか？yで同意します。")
						const invFileIgnore = await booleanIO("最初に「.」が付くファイルを省略しますか？")
						const listerOptions = {
							macOSFileIgnote: false
						}
						if (!invFileIgnore) {
							listerOptions.macOSFileIgnote = await booleanIO("macOSに使用される「._」から始まるファイルを除外しますか？")
						}
						const fileList = await fileLister(beforePass, { contain: folderContain, extensionFilter: ["png", "jpg", "jpeg", "tiff"], invFIleIgnored: invFileIgnore, macosInvIgnored: listerOptions.macOSFileIgnote })
						if (!fileList) {
							console.log("ファイルの取得ができなかったようです。")
							return
						}
						console.log(
							"変換元パス: " + slashPathStr(beforePass) + "\n" +
							"変換先パス: " + slashPathStr(afterPass) + "\n" +
							"変換先サイズ(縦): " + imageSize + "\n" +
							"変換するファイル数: " + fileList.length + "\n" +
							"命名方法: " + sharpConvert.type[nameing - 1] + "\n" +
							"拡張子タイプ: " + sharpConvert.extType[type - 1] + "\n" +
							"ファイル除外方法: " + (() => {
								const ignoreStrings: string[] = []
								if (invFileIgnore) ignoreStrings.push("末端に「.」が付いたファイルを除外")
								if (listerOptions.macOSFileIgnote) ignoreStrings.push("末端に「._」が付いたファイルを除外")
								let str = ""
								for (let i = 0; i !== ignoreStrings.length; i++) {
									if (i !== 0) str += "、"
									str += ignoreStrings[i]
								}
								if (str === "") return "除外しない"
								return str
							})()
						)
						const permission = await booleanIO("上記のデータで実行してもよろしいですか？yと入力すると続行します。")
						if (permission) {
							const convert = new sharpConvert()
							convert.afterPass = afterPass[0]
							convert.nameing = nameing - 1
							convert.size = imageSize
							convert.processd = fileList
							convert.type = (type === 1) ? 0 : 1
							const progressd = new progress()
							progressd.viewStr = "変換中"
							progressd.view()
							convert.on("progress", (now, total) => {
								progressd.now = now
								progressd.total = total
							})
							convert.on("end", () => {
								progressd.view()
								progressd.viewed = false
								console.log("\n変換が完了しました。")
							})
							convert.on("error", e => {
								console.log("エラーを確認しました。: ", e)
							})
							await convert.convert()
						}
					}
				},
				{
					name: "QWERTY Kana Convert",
					function: async () => console.log(kanaConvert(await question("変換元のテキストを入力してください。"), await booleanIO("QWERTYからかなに変換しますか？yで変換、nで逆変換します。")))
				},
				{
					name: "Discord Bot",
					function: async () => {
						const data = await discordBot.data()
						if (!data) {
							console.log("データの準備ができませんでした。")
							return
						}
						const botNames = Object.keys(data)
						for (let i = 0; i === 0;) { //終了(ループ脱出)をするにはiの値を0以外にします。
							const programs: { [programName: string]: () => Promise<void> } = {
								"botを利用する": async () => {
									if (botNames.length === 0) {
										console.log("botが存在しません。新規作成をしてから実行してください。")
										return
									}
									const botChoice = await choice(botNames, "bot一覧", "利用するbotを選択してください。")
									if (botChoice === null) {
										console.log("入力が間違っているようです。最初からやり直してください。")
										return
									}
									if (!shareData.discordBot) shareData.discordBot = {}
									if (!shareData.discordBot[botNames[botChoice - 1]]) shareData.discordBot[botNames[botChoice - 1]] = {
										name: botNames[botChoice - 1]
									}
									const bot = await discordBot.initer(shareData.discordBot[botNames[botChoice - 1]])
									for (let i = 0; i === 0;) { //終了(ループ脱出)をするにはiの値を0以外にします。
										const programs: { [programName: string]: () => Promise<void> } = {
											"起動/停止": async () => {
												await bot.login()
												console.log("ログインしました。停止機能はまだ未検証のため、2度目の起動は行わないでください。")
											},
											"設定": async () => {
												const programs: { [programName: string]: () => Promise<void> } = {
													"Tokenを設定する": async () => {
														const token = await question("Tokenを入力してください。")
														await bot.token(token)
														console.log("設定が完了しました。")
													},
													"プログラムの選択": async () => {
													},
													"戻る": async () => { }
												}
												const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
												if (programChoice === null) {
													console.log("入力が間違っているようです。最初からやり直してください。")
													return
												}
												const choiceProgramName = Object.keys(programs)[programChoice - 1]
												await programs[choiceProgramName]()
											},
											"戻る": async () => {
												i++
											}
										}
										const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
										if (programChoice === null) {
											console.log("入力が間違っているようです。最初からやり直してください。")
											return
										}
										const choiceProgramName = Object.keys(programs)[programChoice - 1]
										await programs[choiceProgramName]()
									}
								},
								"botの新規作成": async () => {
									const name = await question("botの名前を入力してください。")
									if (name === "") {
										console.log("入力が間違っているようです。最初からやり直してください。")
										return
									}
									if (!shareData.discordBot) shareData.discordBot = {}
									if (!shareData.discordBot[name]) shareData.discordBot[name] = {
										name: name
									}
									await discordBot.initer(shareData.discordBot[name])
									console.log("botの生成が完了しました。\nbotの細かな設定を「botを利用する」から行い、Token等の設定をしてください。")
								},
								"botの削除": async () => {
									console.log("現在、botの削除を行うことが出来ません。botの動作中に削除を行った際にエラーが発生する可能性を否めません。")
								},
								"終了": async () => {
									i++
								}
							}
							const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
							if (programChoice === null) {
								console.log("入力が間違っているようです。最初からやり直してください。")
								return
							}
							const choiceProgramName = Object.keys(programs)[programChoice - 1]
							await programs[choiceProgramName]()
						}
					}
				},
				{
					name: "Time Class",
					function: async () => {
						const rawtime = Number(await question("時間を指定してください。"))
						const count = new time()
						count.count(rawtime)
						const year = await booleanIO("年を含めて表示しますか？")
						const days = await booleanIO("日にちを含めて表示しますか？")
						const cou = {
							year: await question("年の数え方を入力してください。"),
							days: await question("日にちの数え方を入力してください。"),
							hour: await question("時間の数え方を入力してください。"),
							min: await question("分の数え方を入力してください。"),
							sec: await question("秒の数え方を入力してください。")
						}
						const fill = Number(await question("数字を埋める数を入力してください。"))
						console.log(count.toString({
							year: year,
							days: year ? false : days,
							count: {
								year: cou.year ? cou.year : undefined,
								days: cou.days ? cou.days : undefined,
								hour: cou.hour ? cou.hour : undefined,
								min: cou.min ? cou.min : undefined,
								sec: cou.sec ? cou.sec : undefined
							},
							fill: (Number.isNaN(fill)) ? undefined : fill
						}))
					}
				},
				{
					name: "FFmpeg Converter",
					function: async () => {
						const data = await dataIO.initer("ffmpeg-converter")
						if (data === null) return
						if (!data.json.presets) {
							data.json.presets = [
								{
									name: "h264(品質21-key120)-通常速度",
									ext: "mp4",
									tag: [
										"-c:v libx264",
										"-c:a aac",
										"-tag:v avc1",
										"-pix_fmt yuv420p",
										"-crf 21",
										"-g 120"
									]
								},
								{
									name: "h264(品質21-key1)-高速処理",
									ext: "mp4",
									tag: [
										"-c:v libx264",
										"-c:a aac",
										"-tag:v avc1",
										"-pix_fmt yuv420p",
										"-preset ultrafast",
										"-tune fastdecode,zerolatency",
										"-crf 21",
										"-g 1"
									]
								},
								{
									name: "h264(リサイズ960x540-品質31-key240)-通常処理",
									ext: "mp4",
									tag: [
										"-c:v libx264",
										"-c:a aac",
										"-tag:v avc1",
										"-vf scale=960x540",
										"-pix_fmt yuv420p",
										"-crf 31",
										"-g 240"
									]
								},
								{
									name: "mp3(128kbps)-30db音量上昇用",
									ext: "mp3",
									tag: [
										"-af volume=30dB",
										"-c:a libmp3lame",
										"-ar 44100",
										"-ab 128"
									]
								}
							]
							await data.save()
						}
						const presets: {
							name: string,
							ext: string,
							tag: string[]
						}[] = data.json.presets
						const programs: { [programName: string]: () => Promise<void> } = {
							"変換を開始する": async () => {
								for (let i = 0; i === 0;) { //終了(ループ脱出)をするにはiの値を0以外にします。
									const programs: { [programName: string]: () => Promise<void> } = {
										"パスを指定しプリセットで変換": async () => {
											const beforePass = await pathChecker(await question("元のソースパスを入力してください。"))
											if (beforePass === null) {
												console.log("入力が間違っているようです。最初からやり直してください。")
												return
											}
											const afterPass = await pathChecker(await question("保存先のフォルダパスを入力してください。"))
											if (afterPass === null) {
												console.log("入力が間違っているようです。最初からやり直してください。")
												return
											}
											const filename = await question("書き出し先のファイル名を入力してください。")
											const presetChoice = await choice((() => {
												let presetNames: string[] = []
												presets.forEach(preset => {
													presetNames.push(preset.name)
												})
												return presetNames
											})(), "プリセット一覧", "使用するプリセットを選択してください。")
											if (!presetChoice) {
												console.log("入力が間違っているようです。最初からやり直してください。")
												return
											}
											console.log(
												"変換元: " + slashPathStr(beforePass) + "\n" +
												"変換先: " + slashPathStr(afterPass) + "/" + filename + "." + presets[presetChoice - 1].ext + "\n" +
												"タグ: " + (() => {
													let tags = ""
													presets[presetChoice - 1].tag.forEach(tag => tags += tag + " ")
													return tags
												})()
											)
											const permission = await booleanIO("上記の内容でよろしいですか？yと入力すると続行します。")
											if (permission) {
												const convert = new ffmpegConverter(slashPathStr(beforePass))
												convert.preset = presets[presetChoice - 1].tag
												console.log(convert.preset)
												if (await sfs.exsits(slashPathStr(afterPass))) {
													if (!await booleanIO("保存先に既に同じ名前のファイルがあります。このまま変換すると上書きされますが、よろしいですか？")) return
												}
												await convert.convert(slashPathStr(afterPass) + "/" + filename + "." + presets[presetChoice - 1].ext)
												console.log("変換が完了しました！")
											}
										},
										"タグを手入力し、詳細な設定を自分で行う": async () => {
											const beforePass = await pathChecker(await question("元のソースパスを入力してください。"))
											if (beforePass === null) {
												console.log("入力が間違っているようです。最初からやり直してください。")
												return
											}
											const afterPass = await pathChecker(await question("保存先のフォルダパスを入力してください。"))
											if (afterPass === null) {
												console.log("入力が間違っているようです。最初からやり直してください。")
												return
											}
											const filename = await question("書き出し先のファイル名を入力してください。")
											const preset = await ffmpegConverter.inputPreset({ tagonly: true })
											console.log(
												"変換元: " + slashPathStr(beforePass) + "\n" +
												"変換先: " + slashPathStr(afterPass) + "/" + filename + "." + preset.ext + "\n" +
												"タグ: " + (() => {
													let tags = ""
													preset.tag.forEach(tag => tags += tag + " ")
													return tags
												})()
											)
											const permission = await booleanIO("上記の内容でよろしいですか？yと入力すると続行します。")
											if (permission) {
												const convert = new ffmpegConverter(slashPathStr(beforePass))
												convert.preset = preset.tag
												console.log(convert.preset)

												if (await sfs.exsits(slashPathStr(afterPass))) {
													if (!await booleanIO("保存先に既に同じ名前のファイルがあります。このまま変換すると上書きされますが、よろしいですか？")) return
												}
												await convert.convert(slashPathStr(afterPass) + "/" + filename + "." + preset.ext)
												console.log("変換が完了しました！")
											}
										},
										"複数ファイルを一括変換": async () => {
											const beforePass = await pathChecker(await question("元のフォルダパスを入力してください。"))
											if (beforePass === null) {
												console.log("入力が間違っているようです。最初からやり直してください。")
												return
											}
											const afterPass = await pathChecker(await question("保存先のフォルダパスを入力してください。"))
											if (afterPass === null) {
												console.log("入力が間違っているようです。最初からやり直してください。")
												return
											}
											const folderContain = await booleanIO("フォルダ内にあるフォルダも変換に含めますか？yで同意します。")
											const invFileIgnore = await booleanIO("最初に「.」が付くファイルを省略しますか？")
											const listerOptions = {
												macOSFileIgnote: false
											}
											if (!invFileIgnore) {
												listerOptions.macOSFileIgnote = await booleanIO("macOSに使用される「._」から始まるファイルを除外しますか？")
											}
											const fileList = await fileLister(beforePass, {
												contain: folderContain,
												extensionFilter: ["mp4", "mov", "mkv", "avi", "m4v", "mts", "mp3", "m4a", "wav", "opus", "caf", "aif", "aiff", "m4r", "alac", "flac", "3gp", "3g2", "webm", "aac", "hevc"],
												invFIleIgnored: invFileIgnore,
												macosInvIgnored: listerOptions.macOSFileIgnote
											})
											const presetChoice = await choice((() => {
												let presetNames: string[] = []
												presets.forEach(preset => {
													presetNames.push(preset.name)
												})
												return presetNames
											})(), "プリセット一覧", "使用するプリセットを選択してください。")
											if (!presetChoice) {
												console.log("入力が間違っているようです。最初からやり直してください。")
												return
											}
											console.log(
												"変換元: " + slashPathStr(beforePass) + "\n" +
												"変換先: " + slashPathStr(afterPass) + "\n" +
												"タグ: " + (() => {
													let tags = ""
													presets[presetChoice - 1].tag.forEach(tag => tags += tag + " ")
													return tags
												})() + "\n" +
												"変換するファイル数: " + fileList.length
											)
											const permission = await booleanIO("上記の内容でよろしいですか？yと入力すると続行します。")
											if (permission) {
												const progressd = new progress()
												progressd.viewStr = "変換中"
												progressd.view()
												progressd.total = fileList.length
												for (let i = 0; i != fileList.length; i++) {
													progressd.now = i
													const convert = new ffmpegConverter(fileList[i].pass + "/" + fileList[i].filename + "." + fileList[i].extension)
													convert.preset = presets[presetChoice - 1].tag

													const convertedPass = slashPathStr(afterPass) + "/" + (await (async () => {
														let outfolders = ""
														const point = fileList[i].point
														for (let i = 0; i !== point.length; i++) {
															outfolders += point[i] + "/"
															if (!(await sfs.exsits(slashPathStr(afterPass) + "/" + outfolders))) await sfs.mkdir(slashPathStr(afterPass) + "/" + outfolders)
														}
														return outfolders
													})()) + fileList[i].filename + "." + presets[presetChoice - 1].ext

													if (await sfs.exsits(convertedPass)) {
														progressd.viewed = false
														if (!await booleanIO("保存先に既に同じ名前のファイルがあります。このまま変換すると上書きされますが、よろしいですか？")) continue
														progressd.view()
													}

													await convert.convert(convertedPass)
												}
												progressd.now = fileList.length
												progressd.view()
												progressd.viewed = false
											}
										},
										"終了": async () => {
											i++
										}
									}
									const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
									if (programChoice === null) {
										console.log("入力が間違っているようです。最初からやり直してください。")
										return
									}
									const choiceProgramName = Object.keys(programs)[programChoice - 1]
									await programs[choiceProgramName]()
								}
							},
							"プリセットの作成・編集": async () => {
								for (let i = 0; i === 0;) { //終了(ループ脱出)をするにはiの値を0以外にします。
									const programs: { [programName: string]: () => Promise<void> } = {
										"プリセット作成": async () => {
											const preset = await ffmpegConverter.inputPreset()
											const name = preset.name
											if (name === null) {
												console.log("名前を読み込めませんでした。")
												return
											}
											presets.push({
												name: name,
												ext: preset.ext,
												tag: preset.tag
											})
											await data.save()
										},
										"プリセット編集": async () => {
											if (!presets[0]) {
												console.log("プリセットがありません。追加してからもう一度やり直してください。")
												return
											}
											const presetChoice = await choice((() => {
												let presetNames: string[] = []
												presets.forEach(preset => {
													presetNames.push(preset.name)
												})
												return presetNames
											})(), "プリセット一覧", "編集するプリセットを選択してください。")
											if (presetChoice === null) {
												console.log("入力が間違っているようです。最初からやり直してください。")
												return
											}
											const programs: { [programName: string]: () => Promise<void> } = {
												"タグを修正": async () => {
													const tagChoice = await choice((() => {
														let tags: string[] = []
														presets[presetChoice - 1].tag.forEach(tag => tags.push(tag))
														return tags
													})(), "タグ一覧", "編集するタグを選択してください。", true)
													if (!tagChoice) {
														console.log("入力が間違ってるようです。もう一度やり直してください。")
														return
													}
													const tagName = await question("新しいタグ名を入力してください。エラー検知はしません。")
													if (tagChoice > (presets[presetChoice - 1].tag.length - 1)) {
														presets[presetChoice - 1].tag.push(tagName)
													} else {
														if (tagName === "") {
															delete presets[presetChoice - 1].tag[tagChoice - 1]
														} else presets[presetChoice - 1].tag[tagChoice - 1] = tagName
													}
												},
												"タグを削除": async () => {
													const tagChoice = await choice((() => {
														let tags: string[] = []
														presets[presetChoice - 1].tag.forEach(tag => tags.push(tag))
														return tags
													})(), "タグ一覧", "削除するタグを選択してください。")
													if (!tagChoice) {
														console.log("入力が間違ってるようです。もう一度やり直してください。")
														return
													}
													presets[presetChoice - 1].tag.splice(tagChoice - 1)
												},
												"プリセット名を変更": async () => {
													presets[presetChoice - 1].name = await question("新しい名前を入力してください。")
												},
												"拡張子を変更": async () => {
													presets[presetChoice - 1].ext = await question("拡張子を入力してください。")
												},
												"プリセットを削除": async () => {
													const permission = await booleanIO("プリセットを削除してもよろしいですか？元に戻すことは出来ません。")
													if (permission) presets.splice(presetChoice - 1)
												},
												"戻る": async () => { return }
											}
											const programChoice = await choice(Object.keys(programs), "機能一覧", "利用する機能を選択してください。")
											if (programChoice === null) {
												console.log("入力が間違っているようです。最初からやり直してください。")
												return
											}
											const choiceProgramName = Object.keys(programs)[programChoice - 1]
											await programs[choiceProgramName]()
											await data.save()
										},
										"プリセット一覧を表示": async () => {
											presets.forEach(preset => {
												console.log(
													"プリセット名: " + preset.name +
													"\nタグ: " + (() => {
														let tags = ""
														preset.tag.forEach(string => tags += string + " ")
														return tags
													})()
												)
											})
										},
										"終了": async () => {
											i++
										},
									}
									const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
									if (programChoice === null) {
										console.log("入力が間違っているようです。最初からやり直してください。")
										return
									}
									const choiceProgramName = Object.keys(programs)[programChoice - 1]
									await programs[choiceProgramName]()
								}
							},
							"終了": async () => {
								return
							}
						}
						const programChoice = await choice(Object.keys(programs), "利用可能な操作一覧", "利用する機能を選択してください。")
						if (programChoice === null) {
							console.log("入力が間違っているようです。最初からやり直してください。")
							return
						}
						const choiceProgramName = Object.keys(programs)[programChoice - 1]
						await programs[choiceProgramName]()
					}
				},
				{
					name: "棒読みちゃん読み上げ",
					function: async () => {
						const data = await dataIO.initer("bouyomi")
						if (data === null) return
						if (!data.json.temp) data.json.temp = null
						const msg = await question("読み上げたい内容を入力してください。")
						if (!data.json.temp || !await booleanIO("前回のデータを再利用しますか？")) {
							const speed = Number(await question("読み上げ速度を入力してください。"))
							const tone = Number(await question("声の高さを入力してください。"))
							const volume = Number(await question("声の大きさを入力してください。"))
							const voice = Number(await question("声の種類を入力してください。"))
							const address = await question("送信先のアドレスを入力してください。空白でlocalhostです。")
							const port = Number(await question("ポートを入力してください。空白で50001です。"))
							data.json.temp = {
								speed: speed ? speed : -1,
								tone: tone ? tone : -1,
								voice: voice ? voice : 0,
								volume: volume ? volume : -1,
								address: address ? address : "localhost",
								port: port ? port : 50001
							}
							await data.save()
						}
						const client = new Bouyomi(data.json.temp)
						await new Promise<void>(resolve => {
							client.on("ready", () => console.log("送信を開始します。"))
							client.on("error", e => {
								console.log("理由: " + e + "により通信エラーが発生しました。")
								resolve()
							})
							client.on("end", () => {
								console.log("送信が完了しました。")
								resolve()
							})
							client.send(msg)
						})
					}
				},
				{
					name: "Folder Copy",
					function: async () => {
						console.log("このプログラムは想定外の入力に弱い傾向にあります。ご了承ください。")
						const beforePass = await pathChecker(await question("移動元のフォルダを指定してください。"))
						if (!beforePass) {
							console.log("入力が間違ってるようです。もう一度やり直してください。")
							return
						}
						const afterPass = await pathChecker(await question("移動先のフォルダを指定してください。"))
						if (!afterPass) {
							console.log("入力が間違ってるようです。もう一度やり直してください。")
							return
						}
						const list = await fileLister(beforePass, { contain: true })
						console.log("移動元のフォルダには" + list.length + "個のファイルたちがあります。")
						if (await booleanIO("移動を開始しますか？")) {
							try {
								let errorNum = 0
								let skipNum = 0
								const prog = new progress()
								prog.view()
								prog.total = list.length
								for (let i = 0; i !== list.length; i++) {
									const point = list[i].point
									let outfolders = ""
									for (let i = 0; i !== point.length; i++) {
										outfolders += point[i] + "/"
										if (!(await sfs.exsits(slashPathStr(afterPass) + "/" + outfolders))) await sfs.mkdir(slashPathStr(afterPass) + "/" + outfolders)
									}
									const fileName = list[i].filename + (list[i].extension ? ("." + list[i].extension) : "")
									const copyDataTo = slashPathStr(afterPass) + "/" + outfolders + fileName
									prog.now = i
									prog.viewStr = "移動中。スキップ[" + skipNum + "] エラー[" + errorNum + "]"
									if (await sfs.exsits(list[i].pass + fileName)) {
										await new Promise<void>(resolve => {
											const Stream = fs.createReadStream(list[i].pass + fileName)
											Stream.pipe(fs.createWriteStream(copyDataTo))
											Stream.on("error", err => {
												errorNum++
											})
											Stream.on("end", () => { resolve() })
										})
									} else {
										skipNum++
									}
								}
								prog.view()
								prog.viewed = false
							} catch (e) { }
						}
					}
				},
				{
					name: "プログラムテスト",
					function: async () => {
						console.log("これを使用してしまうと、強制終了する以外にプログラムを抜ける方法が無くなります。")
						const programs: {
							name: string,
							function: () => Promise<void>
						}[] = [{
							name: "passCheck",
							function: async () => {
								const pass = await question("パスを入力")
								const checked = await pathChecker(pass)
								console.log(checked ? slashPathStr(checked) : null)
							}
						}]
						const programsName = (() => {
							const programsName = []
							for (let i = 0; i !== programs.length; i++) programsName.push(programs[i].name)
							return programsName
						})()
						const programChoice = await choice(programsName, "利用可能なプログラム", "実行したいプログラムを選択してください。")
						if (programChoice === null) {
							console.log("入力が間違っているようです。最初からやり直してください。")
							return
						}
						while (true) {
							await programs[programChoice - 1].function()
						}
					}
				},
				{
					name: "Cryptoによる暗号化",
					function: async () => {
						console.log("現在のところ未完成です。")
						const algorithm = "aes-256-cbc"
						const data = await question("使用する文字列を入力してください。")
						const password = await question("パスワードを入力してください。")
						async function scrypt(password: crypto.BinaryLike, salt: crypto.BinaryLike, keylen: number): Promise<Buffer> {
							return await new Promise<Buffer>(resolve => { crypto.scrypt(password, salt, keylen, (err, derivedKey) => resolve(derivedKey)) })
						}
						const key = await scrypt(password, data, 32)
						const iv = crypto.randomBytes(16)

						const programs: { [programName: string]: () => Promise<void> } = {
							"暗号化": async () => {
								const cipher = crypto.createCipheriv(algorithm, key, iv)
								const crypted = cipher.update("ここに暗号化する文字列", 'utf-8', 'hex')
								const crypted_text = crypted + cipher.final('hex')

								console.log(crypted_text)
							},
							"復号化": async () => {
								const decipher = crypto.createDecipher(algorithm, "ここにパスワード")
								const decrypted = decipher.update("ここに復号化する文字列", 'hex', 'utf-8')
								const decrypted_text = decrypted + decipher.final('utf-8')

								console.log(decrypted_text)
							}
						}
						const programChoice = await choice(Object.keys(programs), "設定・情報一覧", "実行したい操作を選択してください。")
						if (programChoice === null) {
							console.log("入力が間違っているようです。最初からやり直してください。")
							return
						}
						const choiceProgramName = Object.keys(programs)[programChoice - 1]
						await programs[choiceProgramName]()
					}
				},
				{
					name: "Discord BotToken情報収集",
					function: async () => {
						const token = await question("Botのトークンを入力してください。")
						const {
							Client,
							Partials,
							GatewayIntentBits
						} = Discord
						const client = new Client({
							intents: [
								GatewayIntentBits.GuildMembers,
								GatewayIntentBits.MessageContent,
								GatewayIntentBits.Guilds
							],
							partials: [
								Partials.Channel,
								Partials.GuildMember,
								Partials.GuildScheduledEvent,
								Partials.Message,
								Partials.Reaction,
								Partials.ThreadMember,
								Partials.User
							]
						})
						client.on(Discord.Events.Error, err => {
							throw err
						})
						await client.login(token)
						await new Promise<void>(resolve => {
							client.on(Discord.Events.ClientReady, client => {
								resolve()
							})
						})
						const guilds: {
							guildName: string
							guildId: string
							channels: {
								channelName: string
							}[]
							users: {
								displayName: string
								nickName: string | null
							}[]
						}[] = []
						const data = (await client.guilds.fetch())
						data.map(data => {
							data
						})
						client.guilds.cache.map(guild => guilds.push({
							guildName: guild.name,
							guildId: guild.id,
							channels: (() => {
								const channels: {
									channelName: string
								}[] = []
								guild.channels.cache.map(channel => {
									channels.push({
										channelName: channel.name
									})
								})
								return channels
							})(),
							users: (() => {
								const users: {
									displayName: string
									nickName: string | null
								}[] = []
								guild.members.cache.map(member => {
									users.push({
										displayName: member.displayName,
										nickName: member.nickname
									})
								})
								return users
							})()
						}))
						client.destroy()
						console.log("情報が取得されました。")
						while (true) {
						}
					}
				},
				{
					name: "Various Programsの状態・設定",
					function: async () => {
						const programs: { [programName: string]: () => Promise<void> } = {
							"プロセスのメモリ使用率": async () => {
								console.log("メモリ使用率(bytes): " + process.memoryUsage.rss())
							},
							"cuiIOデータをRaw表示": async () => {
								const tmp = JSON.parse(JSON.stringify(cuiIOtmp))
								delete tmp.cache
								console.log(
									"cuiIOtmpに入った不必要なデータは削除されています。\n" +
									JSON.stringify(tmp, null, "  ")
								)
							},
							"キャッシュデータ等のパス設定": async () => {
								const data = await sfs.exsits("passCache.json") ? JSON.parse(String(await sfs.readFile("passCache.json"))) : null
								console.log("現在のキャッシュパス場所は" + (data ? data + "です。" : "設定されていません。"))
								const pass = await pathChecker(await question("キャッシュデータを保存するパスを入力してください。"))
								if (pass === null) {
									console.log("入力が間違っているようです。最初からやり直してください。")
									return
								}
								await sfs.writeFile("passCache.json", JSON.stringify(slashPathStr(pass)))
								console.log(JSON.parse(String(await sfs.readFile("passCache.json"))) + "に変更されました。")
							}
						}
						const programChoice = await choice(Object.keys(programs), "設定・情報一覧", "実行したい操作を選択してください。")
						if (programChoice === null) {
							console.log("入力が間違っているようです。最初からやり直してください。")
							return
						}
						const choiceProgramName = Object.keys(programs)[programChoice - 1]
						await programs[choiceProgramName]()
					}
				}
			]
		console.log(process.env.npm_package_name + " v" + process.env.npm_package_version)
		while (true) {
			const programsName = (() => {
				const programsName = []
				for (let i = 0; i !== programs.length; i++) programsName.push(programs[i].name)
				return programsName
			})()
			const programChoice = await choice(programsName, "利用可能なプログラム", "実行したいプログラムを選択してください。")
			if (programChoice === null) {
				console.log("入力が間違っているようです。最初からやり直してください。")
				continue
			}
			const choiceProgramName = programsName[programChoice - 1]
			console.log(choiceProgramName + "を起動します。")
			try {
				await programs[programChoice - 1].function()
			} catch (e) {
				console.log("プログラム「" + choiceProgramName + "が以下の理由で異常終了したようです。\n", e)
			}
			console.log(choiceProgramName + "が終了しました。")
		}
	}
	/**
	 * expressdは名前の通りexpressを利用しますが、少し変わった点があります。  
	 * それは、cuiIOの上位互換だと言うことです。
	 * 
	 * つまり、cuiIOでのプログラムにアクセスする手段のGUI版と言うことです。
	 * そのため、今後cuiIOとguiIOのプログラム内容の同期を行うための、新しい方法を試行錯誤しておきます。
	 * が、それまではプログラムは全く別になり、同じ操作方法を保証することはないです。
	 */
	export class expressd {
		constructor() { }
		/**
		 * 未完成のため、ここの関数で実行されます。
		 * もしここの関数のみで完成した場合、classを削除しfunctionに置き換えます。
		 * ※sourcedフォルダにデータを入れていますが、main.jsのプログラムを全てここに入れ終えたら、sourcesに名前を変更します。
		 */
		static async main(shareData: {
			discordBot?: {
				[botName: string]: discordRealTimeData
			}
		}): Promise<void> {
			const app = express()
			app.get("*", async (req, res) => {
				/**
				 * リクエスト(要求)された場所
				 */
				const url = req.url
				/**
				 * 応答の種類です。
				 * sourcesフォルダにアクセスするか、その他のデータにアクセスするかを確認し、それに合ったプログラムを実行します。
				 * pass内に「/」で分割し、それを利用してファイル先へアクセスする手がかりにします。
				 * 戻り値にファイルパスを入れる必要があります。
				 */
				const type: { [type: string]: (pass: string[]) => Promise<string> } = {
					"sources": async pass => {
						return ""
					}
				}
				const passArray = url.split("/")
				const passdata = await type[passArray[1]]([...passArray])
			})
		}
	}
}
(async () => {
	const shareData: {
		discordBot?: {
			[botName: string]: sumtool.discordRealTimeData
		}
	} = {}
	sumtool.cuiIO(shareData) //コンソール画面で直接操作するためのプログラムです。
	sumtool.expressd.main(shareData) //ブラウザ等から直感的に操作するためのプログラムです。
})()
