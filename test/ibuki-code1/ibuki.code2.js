const { Client, GatewayIntentBits, Message, EmbedBuilder, ActionRowBuilder, DataResolver, ButtonBuilder, ButtonStyle, SlashCommandBuilder, GatewayVersion, Events } = require('discord.js')
require("dotenv").config() //.envの内容を読み込みます。削除厳禁です。process.env内にデータを入れることが出来なくなります。
/**
 * 非同期関数内でのプログラム一時停止をします。
 * ```js
 * console.log(new Date.now()) //例:35000
 * await sleep(time)
 * console.log(new Date.now()) //36000 <-1000ms増えている
 * ```
 * @param {number} time 待機する時間を入力
 * @returns {Promise<void>}
 */
const sleep = time => { return new Promise((resolve, reject) => { setTimeout(() => { resolve() }, time) }) }
/* 1秒間隔で実行。 */
setInterval(() => {
    //時間を表示
    const date = new Date()
    console.log(
        date.getFullYear() + "年" +
        ("0" + (date.getMonth() + 1)).slice(-2) + "月" +
        ("0" + date.getDate()).slice(-2) + "日" +
        ("0" + date.getHours()).slice(-2) + "時" +
        ("0" + date.getMinutes()).slice(-2) + "分" +
        ("0" + date.getSeconds()).slice(-2) + "秒"
    )
}, 1000);
/**
 * @type {{
 *  ok: string[], 
 *  data: string[], 
 *  data2: string[], 
 *  Englishdata: string[], 
 *  urldata: string[]
 * }}
 */
const data = require("./data.json")
/**
 * プログラム内で値を保持する際に使用します。
 * @type {{
 *  ngStringNo: number
 * }}
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
            const bool = call(str, arr[i])
            if (bool) return { returnd: true, string: arr[i] }
        }
        else if (str === arr[i]) return { returnd: true, string: arr[i] }
    }
    return { returnd: false, string: null }
}

client.on(Events.ClientReady, () => {
    console.log(client.user.username + "#" + client.user.discriminator + "さん。ようこそ")
})

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return
    /**
     * data.okというホワイトリストがあり、その中にあるユーザーIDと照合してホワイトリストに入っていた場合、returndにtrueが入ります。
     */
    const writeListis = arrayIf(message.author.id, data.ok)
    if (!writeListis.returnd) {
        /**
         * @type {{
         *  [name: string]: {
         *      Array: string[],
         *      type: string,
         *      customMessage?: string,
         *      matchFunc?: (str: string, arrStr: string) => (boolean | undefined)
         *  }
         * }}
         */
        const newJSON = {
            NGStr: {
                Array: data.data,
                type: "悪口",
                matchFunc: (str, arrstr) => { return str.match(arrstr) ? true : false }
            },
            NGURL: {
                Array: data.urldata,
                type: "悪URL",
                matchFunc: (str, arrstr) => { return str.match(arrstr) ? true : false }
            },
            NGEng: {
                Array: data.Englishdata,
                type: "悪口英語",
                customMessage: "Don't swear Erase"
            },
            NGAdm: {
                Array: data.data2,
                type: "管理人への悪口"
            },
            NGNeko: {
                Array: [
                    "にゃにゃにゃ！"
                ],
                type: "猫の尊死",
                customMessage: "猫かわええなおい"
            }
        }
        const ngStrings = []
        let delMsgId = ""
        const noGoodis = await (async () => {
            let status = false
            const keys = Object.keys(newJSON)
            for (let i = 0; i !== keys.length; i++) {
                const NG = newJSON[keys[i]]
                const noGood = arrayIf(message.content, NG.Array, (NG.matchFunc ? NG.matchFunc : null))
                if (noGood.returnd) {
                    temp.ngStringNo++
                    ngStrings.push(noGood.string)
                    if (!status) delMsgId = (await message.reply(
                        NG.customMessage ? NG.customMessage : NG.type + "フィルタに一致。\n削除されます。"
                    )).id
                    status = true
                }
            }
            return status
        })()
        if (noGoodis) {
            console.log(
                "悪口メッセージを検知しました。現在の悪口検知数は" + temp.ngStringNo + "です。\n" +
                "現在検知した悪口は" + (() => {
                    let str = ""
                    for (let i = 0; i !== ngStrings.length; i++) str += "「" + ngStrings[i] + "」"
                    return str
                })() + "の" + ngStrings.length + (ngStrings.length < 10 ? "つ" : "個") + "です"
            )
            await sleep(1000)
            await message.delete()
            await sleep(5000)
            await message.channel.messages.cache.get(delMsgId).delete()
            //メッセージを削除したため、これ以上の動作をしてエラーになる危険を回避するべく、returnをつけます。
            return
        }
    }
})
client.login(process.env.token)