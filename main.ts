import readline from "readline"
import express from "express"
/**
 * various-programsのGUIを作成するのが、かなり難しい状態になったため、まずはCUIから作ることにいたします。
 * CUIでもGUIのような使い勝手の良さを実感してください。
 * 改良や機能追加が楽になるように設計いたします。
 */

namespace sumtool {
    export class time {
        #sec = 0
        #min = 0
        #hour = 0
        #hourRaw = 0
        #days = 0
        #daysRaw = 0
        #year = 0
        #convertTime = 0
        constructor(seconds: number) {
            this.count(seconds)
        }
        count(seconds: number) {
            const time = Date.now()
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
            this.#convertTime = Date.now() - time
        }
        setting(up: boolean) {
            this.#sec += (up ? 1 : -1)
            if (this.#sec === 60) {
                this.#sec = 0
                this.#min++
            }
            if (this.#sec === -1) {
                this.#sec = 59
                this.#min--
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
        toJSON() {
            return {
                sec: this.#sec,
                min: this.#min,
                hour:this.#hour,
                hourRaw: this.#hourRaw,
                days: this.#days,
                daysRaw: this.#daysRaw,
                year: this.#year,
                convertTime: this.#convertTime
            }
        }
    }
    export async function question(text: string): Promise<string> {
        const iface =
            readline.createInterface({ input: process.stdin, output: process.stdout })
        return await
            new Promise((resolve => iface.question(text + "> ", answer => { iface.close(); resolve(answer) })))
    }
    export async function cuiIO() {
        console.log(
            "利用可能なプログラム: \n" +
            "[1] Image Resize"
        )
        const programChoice = Number(await question("実行したいプログラムを選択してください。"))
    }
}
