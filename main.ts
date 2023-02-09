import readline from "readline"
import express from "express"
/**
 * various-programsのGUIを作成するのが、かなり難しい状態になったため、まずはCUIから作ることにいたします。
 * CUIでもGUIのような使い勝手の良さを実感してください。
 * 改良や機能追加が楽になるように設計いたします。
 */

namespace sumtool {
    export function times(seconds: number, option?: { days?: boolean }) {
        const calcStartTime = Date.now()
        let sec: number = 0, min: number = 0, hour: number = 0, days: number = 0
        for (let i = 0; i < seconds; i++) {
            sec++
            if (sec === 60) {
                sec = 0
                min++
                if (min === 60) {
                    min = 0
                    hour++
                    if (option)
                        if (option.days && hour === 24) {
                            hour = 0
                            days++
                        }
                }
            }
        }
        return {
            sec, min, hour, days,
            toString: (string?: { sec?: string, min?: string, hour?: string, days?: string }): string => {
                let timeString = 0
                const second = sec + (string ? (string.sec ? string.sec : null) : "秒")
                const minute = min + (string ? (string.min ? string.min : null) : "分")
                const hour1 = hour + (string ? (string.hour ? string.hour : null) : "時間")
                const days1 = days + (string ? (string.days ? string.days : null) : "日")
                if (min) timeString = 1
                if (hour) timeString = 2
                if (days) timeString = 3

                return ((2 < timeString) ? days1 : "") +
                    ((1 < timeString) ? hour1 : "") +
                    ((0 < timeString) ? minute : "") +
                    second
            },
            calcTime: (Date.now() - calcStartTime) / 1000
        }
    }
    class time {
        #sec: number = 0
        #min
        #hour
        #days
        constructor(seconds: number) {
            let sec: number = 0, min: number = 0, hour: number = 0, days: number = 0
            for (let i = 0; i < seconds; i++) {
                sec++
                if (sec === 60) {
                    sec = 0
                    min++
                    if (min === 60) {
                        min = 0
                        hour++
                        if (hour === 24) {
                            hour = 0
                            days++
                        }
                    }
                }
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
        await question("実行したいプログラムを選択してください。")
    }
}