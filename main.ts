import readline from "readline"
import express, { raw } from "express"
import fs from "fs"
/**
 * various-programsのGUIを作成するのが、かなり難しい状態になったため、まずはCUIから作ることにいたします。
 * CUIでもGUIのような使い勝手の良さを実感してください。
 * 改良や機能追加が楽になるように設計いたします。
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
        constructor(seconds: number, rawData?: tempTime) {
            this.count(seconds)
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
        count(seconds: number) {
            const converttime = Date.now()
            const up = Math.sign(seconds)
            let num = 0
            if (up === 1) while (num < seconds) {
                this.setting(true)
                num++
            }
            if (up === -1) while (seconds < num) {
                this.setting(false)
                num--
            }
            this.#convertTime = Date.now() - converttime
        }
        setting(up: boolean) {
            this.#sec += (up ? 1 : -1)
            this.#secRaw += (up ? 1 : -1)
            if (this.#sec === 60) {
                this.#sec = 0
                this.#min++
                this.#minRaw++
            }
            if (this.#sec === -1) {
                this.#sec = 59
                this.#min--
                this.#minRaw--
            }
            if (this.#min === 60) {
                this.#min = 0
                this.#hour++
                this.#hourRaw++
            }
            if (this.#min === -1) {
                this.#min = 50
                this.#hour--
                this.#hourRaw--
            }
            if (this.#hour === 24) {
                this.#hour = 0
                this.#days++
                this.#daysRaw++
            }
            if (this.#hour === -1) {
                this.#hour = 23
                this.#days--
                this.#daysRaw--
            }
            if (this.#days === 365) {
                this.#days = 0
                this.#year++
            }
            if (this.#days === -1) {
                this.#days = 364
                this.#year--
            }
        }
        toString(option?: { days?: boolean, year?: boolean, count?: { sec?: string, min?: string, hour?: string, days?: string, year: string } }) {
            const outputRaw = {
                days: false,
                year: false
            }
            const counter = { sec: "秒", min: "分", hour: "時間", days: "日", year: "年" }
            if (option) {
                if (option.days) outputRaw.days = true
                if (option.year) outputRaw.year = true, outputRaw.days = true
                if (option.count) {
                    const count = option.count
                    if (count.year) counter.year = count.year
                    if (count.days) counter.days = count.days
                    if (count.hour) counter.hour = count.hour
                    if (count.min) counter.min = count.min
                    if (count.sec) counter.sec = count.sec
                }
            }
            const sec = this.#sec
            const min = this.#min
            const hour = outputRaw.days ? this.#hour : this.#hourRaw
            const days = outputRaw.year ? this.#days : this.#daysRaw
            const year = this.#year
            let timeString = 0
            if (min) timeString = 1
            if (hour) timeString = 2
            if (outputRaw.days && days) timeString = 3
            if (outputRaw.year && year) timeString = 4
            return (3 < timeString ? year + counter.year : "") +
                (2 < timeString ? days + counter.days : "") +
                (1 < timeString ? hour + counter.hour : "") +
                (0 < timeString ? min + counter.min : "") +
                sec + counter.sec
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
    interface passout extends fs.Stats {
        pass: string
    }
    export async function passCheck(string: string): Promise<passout> {
        const pass = (() => {
            const passArray = string.split("/")
            let passtmp = ""
            for (let i = 0; i != passArray.length; i++) passtmp += passArray[i] + (((i + 1) !== passArray.length) ? "/" : "")
            if (fs.existsSync(passtmp)) return passtmp
            while (passtmp[passtmp.length - 1] === " ") passtmp = passtmp.slice(0, -1)
            if (fs.existsSync(passtmp)) return passtmp
            passtmp = passtmp.replace(/\\ /i, " ")
            if (fs.existsSync(passtmp)) return passtmp
            return null
        })()
        if (!pass) return null
        const stats: fs.Stats = await new Promise(resolve => fs.stat(pass, (err, stats) => resolve(stats)))
        return { pass: pass, ...stats }
    }
    export async function question(text: string): Promise<string> {
        const iface =
            readline.createInterface({ input: process.stdin, output: process.stdout })
        return await
            new Promise(resolve => iface.question(text + "> ", answer => { iface.close(); resolve(answer) }))
    }
    export async function cuiIO() {
        console.log(
            "利用可能なプログラム: \n" +
            "[1] Image Resize"
        )
        const programChoice = Number(await question("実行したいプログラムを選択してください。"))
    }
}
