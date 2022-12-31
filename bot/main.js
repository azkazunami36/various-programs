const { count } = require('console');
const { Client, GatewayIntentBits, Message, EmbedBuilder, MessageActionRow, MessageButton, DataResolver } = require('discord.js');
require("dotenv").config();
require('date-utils');
const sharp =require('sharp')
let cmdexec = 0;
let ari = 0;
let countb = 0;
const data = require("./data.json") //data.json
//const//
let counta = 0;
const random = Math.random()
const Num = Math.floor(random * 4)
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
        console.log(countb)
    }, 1000);
})()
//json計測器//
for (let i = 0; i != data.data.length; i++) {
     countb++
}
for (let i = 0; i != data.Englishdata.length; i++) {
     countb++
}
//画像処理中心核//
sharp('data/1.jpg')
  .resize(512)
  .toFile('data/1_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)
  })
sharp('data/2.jpg')
  .resize(512)
  .toFile('data/2_0.jpg', (info)=>{     //こんな感じでok?  めんどくさかった
    console.log(info)
  })
sharp('data/3.jpg')
  .resize(512)
  .toFile('data/3_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)
  })
sharp('data/4.jpg')
  .resize(512)
  .toFile('data/4_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)
  })
sharp('data/5.jpg')
  .resize(512)
  .toFile('data/5_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)

  })
sharp('data/6.jpg')
  .resize(512)
  .toFile('data/6_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)
  })
sharp('data/7.jpg')
  .resize(512)
  .toFile('data/7_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)
  })
sharp('data/8.jpg')
  .resize(512)
  .toFile('data/8_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)
  })
sharp('data/9.jpg')
  .resize(512)
  .toFile('data/9_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)
  })
sharp('data/10.jpg')
  .resize(512)
  .toFile('data/10_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)
  })
sharp('data/11.jpg')
  .resize(512)
  .toFile('data/11_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)
  })
sharp('data/12.jpg')
  .resize(512)
  .toFile('data/12_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)
  })



sharp('data/0.jpg')
  .resize(512)
  .toFile('data/0_0.jpg', (info)=>{     //こんな感じでok?
    console.log(info)
  })


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

    let idiotis = false //不適切発言をしたかどうか
    let mediaidiotis = false //不適切動画メディアのURLを入力したかどうか
    let admintoidiotis = false //管理人に不適切(ry
    let engidiotis = false //英語で不適s(ry
    for (let i = 0; i != data.ok.length; i++) { //ホワイトリストの数だけ
        if (message.author.id != data.ok[i]) { //ホワイトリストに入っていないと
            /**
             * ちなみにletで重複したi変数を宣言しても、ブロックないで処理されるから  
             * 下のforと上のforではiの内容は異なる
             */
            for (let i = 0; i != data.data.length; i++) { //dataの数だけ
                if (message.content.match(data.data[i])) { //マッチする言葉を探して
                    console.log(data.data[i] + "とマッチしました")
                    idiotis = true
                    const username =message.author.username
                    if (data.data[i] === "それってあなたの感想ですよね"){
                        message.channel.send("僕の感想で何か悪いですか？")
                    if (data.data[i] === "伊吹chゴミ"){
                        message.channelId='1057461118676779068'.send("悪口を言われました")
                    }
                    if (data.data[i] === "まんこ"){
                        message.channel.send("やめよう...")
                    }
                    if (data.data[i] === "ゴミ"){
                        if (message.content === "ゴミ箱"){
                            message.channel.send("すいませんゴミ箱も消えてしまうんですw")
                        }
                    }
                }
            }
            for (let i = 0; i != data.urldata.length; i++) {
                if (message.content.match(data.urldata[i])) {
                    console.log(data.urldata[i] + "とマッチしました")
                    mediaidiotis = true
                }
            }
            for (let i = 0; i != data.data2.length; i++) {
                if (message.content === data.data2[i]) {
                    admintoidiotis = true
                }
            }
            for (let i = 0; i != data.Englishdata.length; i++) {
                if (message.content === data.Englishdata[i]) {
                    console.log(data.Englishdata[i] + "とマッチしました")
                    engidiotis = true

                }
                }
            }
        }
    }
    if (idiotis) {
        message.reply("不適切な言葉です\n消しましました\n" + "ご協力" + data.data3)
            .then(() => message.delete()); //ちなみにthenはbotが送信したほうのmessageが取得できる
        message.channel.send("なんかやなことでもあった？ https://www.youtube.com/watch?v=O1gB_aoVJQY&list=PLJKqOK4B8ZrXTgkYZdPYZcYT3vG7ARJls&index=24")
    
        counta++
    } else if (mediaidiotis) {
        message.reply("不適切な動画URLを消しました")
            .then(() => message.delete());
        counta++
    } else if (admintoidiotis) {
        message.users.get("1033611588999053412").send(message.author.username + "がサーバーまたはサーバー管理者への悪口を言いました\nBANするかはあなた次第です")
        message.reply("サーバーまたはサーバー管理者への悪口を感知しました\nこの情報は管理者チャットに送られます")
            .then(() => message.delete());
        counta++
    } else if (engidiotis) {
        message.reply("Don't swear Erase")      //English
            .
            counta++
    }
    if (idiotis || mediaidiotis || admintoidiotis || engidiotis) return
    if (message.content === "なんで") message.reply("悪口だから")
    if (idiotis) {
        message.reply("不適切な言葉です\n消しましました\n" + "ご協力" + data.data3)
            .then(() => message.delete()); //ちなみにthenはbotが送信したほうのmessageが取得できる


        counta++
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
        message.reply("このbotは不適切なメッセージを消したりします"+"\n 今現在"+countb+"の単語を記録しています\n"+"お問い合わせは開発担当の伊吹ch/YUKKEまで")
        message.channel.send("でも**結局は誰の需要もないんだ**")
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
    if (message.content === "はじめまして") {
        const username = message.author.username
        message.reply("はじめまして" + username + "さん")
        message.channel.send("English/Nice to meet you!")
    }
    if (message.content === "Nice to meet you") {
        const username = message.author.username
        message.reply("Nice to meet you"+username)
        message.channel.send("はじめまして")
    }
    if (message.content === "voice!add https://www.youtube.com/watch?v=iAa_X95ypSE"){
        if (message.content === "voice!play"){
            sleep(13500, function() {
              message.channel.send("熱を奪ってゆく\n路地裏の香りが")
            });
            sleep(500, function() {
              message.channel.send('昨日までの僕\n忘れさせたんだ');
            });
        

            
        }
    }
    if (message.content === "画像"){
        const random = Math.random()
        const Num = Math.floor(random * 13)

            message.channel.send({ files: ['./'+Num+'_0.jpg'] })
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