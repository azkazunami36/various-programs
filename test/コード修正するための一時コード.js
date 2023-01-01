const {
    Client,
    GatewayIntentBits
} = require('discord.js'); //使っていない変数は消すといい
require('date-utils'); //これを変数に格納しない場合、これを使用することは出来ない
require("dotenv").config(); //envの取り込み
const wait = async time => { //待機用変数
    await new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}
(async () => {
    setInterval(() => {
        var dt = new Date();
        var formatted = dt.toFormat("YYYY年MM月DD日HH24時MI分SS秒");
        let sum = 0 //この変数は使用されていない

        console.log(formatted);
        console.log(countb)
    }, 1000);
})()

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
        GatewayIntentBits.MessageContent
    ]
})
const loga = 0 //使われていない
client.on('messageCreate', message => {  //切れてるのか横も
    if (message.author.bot) return;
    if (message.content === "あけましておめでとうございます") {
        message.reply("あけおめ～ことよろ～")
    }
})
client.on('ready', async () => {
    console.log("実行開始") //これが表示されるとログインに完了した証拠
    setInterval(() => console.log("実行中\n閉じないで下さい"), 60000);
})
client.login(process.env.token) //ログイン関数が２つあったため削除
