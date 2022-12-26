const { count } = require('console');
const { Client, GatewayIntentBits, Message } = require('discord.js');
require("dotenv").config();
require('date-utils');
let cmdexec = 0;
const data = require("./data.json") //data.json

//時計//
const wait = async time => {
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
        let sum = 0

        console.log(formatted);
    }, 1000);
})()

//権限//

const client = new Client(
    {
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
    }
)
const loga = 0
client.on('messageCreate', message => {  //切れてるのか横も
    if (message.author.bot) return;

    for (let i = 0; i != data.data.length; i++) {
        if (message.content.match(data.data[i])) {
            message.reply("不適切な言葉です\n今すぐ消しなさい")
            message.delete();
        }
    }
    if (message.content === "こんにちは") {
        cmdexec++
        const loga = "J=E1"
        const username = message.author.username
        message.reply("こんにちは!!!" + username)
        message.channel.send("English/Hello")
        console.log("コマンド名\n" + loga + "\n実行user" + username + "による実行")
    }
    if (message.content === "/help") {
        cmdexec++
        const username = message.author.username
        const loga = "help(J+E)"
        message.reply("自分で考えようぜ")
        message.reply("Let's figure it out for ourselves")
        console.log("コマンド名\n" + loga + "\n実行user" + username + "による実行")

    }
    if (message.content === "Hello") {
        cmdexec++
        const loga = "E=J2"
        const username = message.author.username
        message.reply("hello" + username)
        message.channel.send("日本語/こんにちは")
        console.log("コマンド名\n" + loga + "\n実行user" + username + "による実行")
    }
    else if (message.content === "hello") {
        cmdexec++
        const username = message.author.username
        const loga = "errorcommand-E=J2-hello_error"
        message.reply("Helloと書いてください")
        console.log("コマンド名\n" + loga + "\n実行user" + username + "による実行")
    }
    if (message.content === "おはよう") {
        cmdexec++
        const loga = "J=E3"
        const username = message.author.username
        message.reply("おはよう" + username + "\n良い一日を")
        message.channel.send("English/goodmorning")
        console.log("コマンド名\n" + loga + "\n実行user" + username + "による実行")
    }



})
client.on('ready', async () => {
    setInterval(() => console.log("実行中\n閉じないで下さい"), 60000);
})
process.on("exit", exitCode => {
    console.log(cmdexec)
});
process.on("SIGINT", () => process.exit(0));
client.login(process.env.token)