import readline from "readline"
import express from "express"
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
            if (option.timeString !== undefined) timeString = option.timeString
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
    export function numfiller(number: number, fillnum: number, option?: { overflow?: boolean }): string {
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
    export async function wait(time: number) { await new Promise<void>(resolve => setTimeout(() => resolve(), time)) }
    export async function exsits(pass: string): Promise<Boolean> { return await new Promise(resolve => { fs.access(pass, err => resolve(err === null)) }) }
    export async function passCheck(string: string): Promise<{ pass: string } & fs.Stats> {
        const pass = await (async () => {
            const passArray = string.split("/")
            let passtmp = ""
            for (let i = 0; i != passArray.length; i++) passtmp += passArray[i] + (((i + 1) !== passArray.length) ? "/" : "")
            if (!await exsits(passtmp)) return passtmp
            while (passtmp[passtmp.length - 1] === " ") passtmp = passtmp.slice(0, -1)
            if (!await exsits(passtmp)) return passtmp
            passtmp = passtmp.replace(/\\ /i, " ")
            if (!await exsits(passtmp)) return passtmp
            return null
        })()
        if (!pass) return null
        const stats: fs.Stats = await new Promise(resolve => fs.stat(pass, (err, stats) => resolve(stats)))
        return { pass: pass, ...stats }
    }
    export async function choice(title: string, int: string, array: string[]): Promise<number> {
        console.log(title + ": ")
        for (let i = 0; i !== array.length; i++) console.log("[" + (i + 1) + "] " + array[i])
        return Number(await question(int))
    }
    export async function question(text: string): Promise<string> {
        const iface =
            readline.createInterface({ input: process.stdin, output: process.stdout })
        return await
            new Promise(resolve => iface.question(text + "> ", answer => { iface.close(); resolve(answer) }))
    }
    export async function cuiIO() {
        const programChoice = await choice("利用可能なプログラム", "実行したいプログラムを選択してください。", ["Image Resize"])
        switch (programChoice) {
            case 1: {
                break
            }
        }
    }
}
