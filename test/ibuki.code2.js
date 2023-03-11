const { Client, GatewayIntentBits, Message, EmbedBuilder, ActionRowBuilder, DataResolver, ButtonBuilder, ButtonStyle, SlashCommandBuilder, GatewayVersion, Events } = require('discord.js')
require("date-utils"); //Date()のプログラム拡張に使用。削除厳禁です。toFormat()が利用できなくなります。
require("dotenv").config() //.envの内容を読み込みます。削除厳禁です。process.env内にデータを入れることが出来なくなります。
/**
 * 非同期関数内でのプログラム一時停止をします。
 * ```js
 * console.log(new Date.now()) //例:35000
 * await sleep(time)
 * console.log(new Date.now()) //36000 <-1000ms増えている
 * @param {number} time 待機する時間を入力
 * @returns {Promise<void>}
 */
const sleep = time => { return new Promise((resolve, reject) => { setTimeout(() => { resolve() }, time) }) }
/**
 * 1秒間隔で実行。
 */
setInterval(() => {
    //時間を表示
    console.log(Date().toFormat("YYYY年MM月DD日HH24時MI分SS秒"))
}, 1000);
/**
 * @type {{ok: string[], data: string[], data2: string[], Englishdata: string[], urldata: string[]}}
 */
const data = require("data.json")
/**
 * プログラム内で値を保持する際に使用します。
 * @type {{ngStringNo: number}}
 */
const temp = {
    ngStringNo: 0
}

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildBans,
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
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution
    ]
})
/**
 * stringの配列とただの配列をifで比較します。
 * @param {string} str 
 * @param {string[]} arr 
 * @param {(str: string, arrStr: string) => (boolean | undefined)} call
 * @returns {{returnd: boolean, string: string}}
 */
function arrayIf(str, arr, call) {
    let stats = { returnd: false, string: null }
    for (let i = 0; i !== arr.length; i++) {
        if (call) {
            const bool = call()
            if (bool) return { returnd: true, string: arr[i] }
        }
        else if (str === arr[i]) return { returnd: true, string: arr[i] }
    }
    return { returnd: false, string: null }
}
client.on(Events.MessageCreate, message => {
    if (message.author.bot) return
    /**
     * data.okというホワイトリストがあり、その中にあるユーザーIDと照合してホワイトリストに入っていた場合、trueが入ります。
     */
    const writeListis = arrayIf(message.author.id, data.ok)
    if (!writeListis.returnd) {
        const noGoodMessage = arrayIf(message.content, data.data)
        const noGoodURL = arrayIf(message.content, data.urldata, (str, arrstr) => { if (str.match(arrstr)) return true })
        const noGoodEngMsg = arrayIf(message.content, data.Englishdata)
        const noGoodAdminTo = arrayIf(message.content, data.data2)
        const ngStrings = []
        if (noGoodMessage.returnd) {
            temp.ngStringNo++
            ngStrings.push(noGoodMessage.string)
        }
        if (noGoodURL.returnd) {
            temp.ngStringNo++
            ngStrings.push(noGoodURL.string)
        }
        if (noGoodEngMsg.returnd) {
            temp.ngStringNo++
            ngStrings.push(noGoodEngMsg.string)
        }
        if (noGoodAdminTo.returnd) {
            temp.ngStringNo++
            ngStrings.push(noGoodAdminTo.string)
        }
        if (noGoodMessage.returnd || noGoodURL.returnd || noGoodEngMsg.returnd || noGoodAdminTo.returnd) {
            console.log(
                "悪口メッセージを検知しました。現在の悪口検知数は" + temp.ngStringNo + "です。\n" +
                "現在検知した悪口は" + (() => {
                    let str = ""
                    for (let i = 0; i !== ngStrings.length; i++) str += "「" + ngStrings[i] + "」"
                    return str
                })() + "の" + ngStrings.length + (ngStrings.length < 10 ? "つ" : "個") + "です"
            )
        }
    }

})