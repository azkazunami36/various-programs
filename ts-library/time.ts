import numfiller from "./numFiller"
import wait from "./wait"

export interface tempTime {
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
export interface toStringOption {
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
export default time