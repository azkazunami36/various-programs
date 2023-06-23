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

import numFiller from "ts-library/numFiller"
import sfs from "ts-library/fsSumwave"
import textLength from "ts-library/textLength"
import wait from "ts-library/wait"
import time from "ts-library/time"
import pathChecker from "ts-library/pathChecker"
import slashPathStr from "ts-library/slashPathStr"
import consoleUIPrograms from "ts-library/consoleUIPrograms"
import fileLister from "ts-library/fileLister"
import dataIO from "ts-library/dataIO"
import { discordRealTimeData } from "ts-library/discord-bot"
import sharpConvert from "ts-library/sharpConvert"
import kanaConvert from "ts-library/kanaConvert"
import discordBot from "ts-library/discord-bot"
import ffmpegConverter from "ts-library/ffmpegConverter"

const { question, choice, booleanIO } = consoleUIPrograms
/**
 * 改善する前に、README.mdをお読みください。
 * しかし、読まなくても僕がコードを確認するので、重要事項ではないことはご了承ください。
 */

namespace sumtool {
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
			[botName: string]: discordRealTimeData
		}
	} = {}
	sumtool.cuiIO(shareData) //コンソール画面で直接操作するためのプログラムです。
	sumtool.expressd.main(shareData) //ブラウザ等から直感的に操作するためのプログラムです。
})()
