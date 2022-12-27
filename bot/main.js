const { count } = require('console');
const { Client, GatewayIntentBits, Message, EmbedBuilder, MessageActionRow, MessageButton } = require('discord.js');
require("dotenv").config();
require('date-utils');
let cmdexec = 0;
const data = require("./data.json") //data.json
//const//
let counta = 0;
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

<<<<<<< Updated upstream
    for (let i = 0; i != data.data.length; i++) { //dataの数だけ
        for (let i = 0; i != data.ok.length; i++) {
            if (message.author.id == data.ok[i]) return //returnの後に実行したいコードを入力すること
            if (message.content.match(data.data[i])) {
                counta++
                console.log(data.data[i] + "とマッチしました")
                message.reply("不適切な言葉です\n消しました")
                    .then(() => message.delete());
                return
            }
            else if (message.content === "なんで") {
                message.reply("悪口だから")
                return
            }

        }
    }
    for (let i = 0; i != data.urldata.length; i++) {
        if (message.content.match(data.urldata[i])) {
            counta++
            console.log(data.urldata[i] + "とマッチしました")

            message.reply("不適切な動画URLを消しました")
                .then(() => message.delete());
            return

=======
    for (let i = 0; i != data.data.length; i++) {
        if (message.content === data.data[i]) {
            message.reply("不適切な言葉です\nこのメッセージを削除します")
            message.delete();
>>>>>>> Stashed changes
        }
    }
    for (let i = 0; i != data.data2.length; i++) {
        if (message.content === data.data2[i]) {
            message.reply("サーバーまたはサーバー管理者への悪口を感知しました\nこの情報は管理者チャットに送られます")
            message.delete();
            const banuserneme = message.author.username
            message.users.get("1033611588999053412").send(banuserneme+"がサーバーまたはサーバー管理者への悪口を言いました\nBANするかはあなた次第です")
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
        message.reply("このbotは不適切なメッセージを消したりします")
        console.log("コマンド名\n" + loga + "\n実行user" + username + "による実行")

    }
    if (message.content === "/GUI") {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('primary')
                    .setLabel('Primary')
                    .setStyle('PRIMARY'),
            );
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
    if (message.content === "はじめまして") {
        const username = message.author.username
        message.reply("はじめまして" + username + "さん")
        message.channel.send("English/Nice to meet you!")
    }




})
client.on('ready', async () => {
    setInterval(() => console.log("実行中\n閉じないで下さい"), 60000);
})
process.on("exit", exitCode => {
    console.log(cmdexec)
    console.log("botが実行されているときに起きた暴言等は" + counta + "回です")
});
process.on("SIGINT", () => process.exit(0));
client.login(process.env.token)