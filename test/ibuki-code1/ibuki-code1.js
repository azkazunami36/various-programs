const { Client, GatewayIntentBits, Message, EmbedBuilder, ActionRowBuilder, DataResolver, ButtonBuilder, ButtonStyle,SlashCommandBuilder, GatewayVersion} = require('discord.js');
require("dotenv").config();
const { entersState, AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType } = require('@discordjs/voice');
let jsonFile = require('jsonfile');
const ytdl = require("ytdl-core");
const ytpl = require("ytpl")
require('date-utils');
const fs = require("fs")
const sharp = require('sharp')
var async = require('async'); //このようなパッケージは存在しない
let cmdexec = 0;
let ari = 0;
let countb = 0;
const data = require("./data.json") //data.json
/**
 * sleep.js
 */
 const sleep = (time) => {
  return new Promise((resolve, reject) => {
      setTimeout(() => {
          resolve()
      }, time)
  })
}

module.exports = sleep
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

/**
 * これはforを使う必要はなく
 * countb = data.data.length + data.Englishdata.length
 * で出来る
 */
for (let i = 0; i != data.data.length; i++) {
  countb++
}
for (let i = 0; i != data.Englishdata.length; i++) {
  countb++
}




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
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.AutoModerationConfiguration,
      GatewayIntentBits.AutoModerationExecution

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
        if (message.content === (data.data[i])) { //マッチする言葉を探して
          console.log(data.data[i] + "とマッチしました")
          idiotis = true
          const username = message.author.username
          const black = message.author.id
          setInterval(() => {

          
            return

          }, 1);
          if (data.data[i] === "それってあなたの感想ですよね") {
            message.channel.send("僕の感想で何か悪いですか？")
            if (data.data[i] === "伊吹chゴミ") {
              message.channelId = '1057461118676779068'.send("悪口を言われました") //これ動くの！？ さぁ 動かんと思う
            }
            if (data.data[i] === "まんこ") {
              message.channel.send("やめよう...")
            }
            if (data.data[i] === "ゴミ") {
              if (message.content === "ゴミ箱") {
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
            const black = message.author.id
            client.users.cache.get(black).send('You were blacklisted for ranting on some server.')
            engidiotis = true

          }
        }
      }
    }
  }
  for (let e = 0; 1 != data.kaiwa.length; e++) {
    if (message.content === data.kaiwa[e]) {
          if (data.kaiwa === "こんにちは"){
            message.reply("やぁ  調子はどうだい？")
          }
          if (data.kaiwa === "こんばんは"){
            message.reply("おっ　こんばんは～")
          }
    }
  }
  if (idiotis) {
    message.reply("不適切な言葉です\n消しましました\n" + "ご協力" + data.data3)
      .then(() => message.delete()); //ちなみにthenはbotが送信したほうのmessageが取得できる

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
    message.reply("このbotは不適切なメッセージを消したりします" + "\n 今現在" + countb + "の単語を記録しています\n" + "お問い合わせは開発担当の伊吹ch/YUKKEまで")
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
    message.reply("Nice to meet you" + username)
    message.channel.send("はじめまして")
  }
  if (message.content === "voice!add https://www.youtube.com/watch?v=iAa_X95ypSE") {
    if (message.content === "voice!play") {
      sleep(13500, function () {
        message.channel.send("熱を奪ってゆく\n路地裏の香りが")
      });
      sleep(500, function () {
        message.channel.send('昨日までの僕\n忘れさせたんだ');
      });



    }
    
  }
  if (message.content === "画像") {
    const random = Math.random()
    const Num = Math.floor(random * 16)

    message.channel.send({ files: ['data/' + Num + '_0.jpg'] })
  }
  if (message.content === "画像指定1"){
    message.channel.send({ files: ['data/'+'1'+'_0.jpg']})
  }
  if (message.content === "画像指定2"){
    message.channel.send({ files: ['data/'+'2'+'_0.jpg']})
  }
  if (message.content === "画像指定3"){
    message.channel.send({ files: ['data/'+'3'+'_0.jpg']})
  }
  if (message.content === "画像指定4"){
    message.channel.send({ files: ['data/'+'4'+'_0.jpg']})
  }  
  if (message.content === "/2ch") {
    const wait = async time => {
      const thread = await message.channel.threads.create({
        name: 'food-talk',
        autoArchiveDuration: 60,
        reason: 'Needed a separate thread for food',
      });

      console.log(`Created thread: ${thread.name}`);
    }
  }

  if (message.channel.id === "1057461166869319710") {
    if (message.content = "ああ") {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('primary')
            .setLabel('Click me!')
            .setStyle(ButtonStyle.Primary),
        );
      message.reply({
        content: "スタッフが駆け付けるまで少々お待ちください",
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('primary')
                .setLabel('スタッフ到着')
                .setStyle(ButtonStyle.Primary),
            )]
      }); //変数を書き換えましょう。messageに
      
      
    }
    
  }
  if (message.content === "あけましておめでとうございます"){
    message.reply("あけおめ～ことよろ～")
  }
  if (message.content === "!おみくじ!"){
    message.reply("準備中")
    if (message.content.Math === "w"){
      message.reply("わらうな")
    }
  }
  

})
const sa = {
  "1033611588999053412": {
    "data": {
      "text": "いえーい"
    }
  },
  "735030307883057262": {
    "data":{
      "text" : "いえーい2"
    }
  },
  "i719068866759622668": {
    "data":{
      "text" : "いえーい3"
    }
  }
}
client.on("messageCreate", message => {
  
     if(message.content === "本日はインタビューよろしくお願いいたします"){
  console.log("はい、\nよろしくお願いいたします。")
 }
})
client.once("ready", async () => {
  const data = [
    {
       name: "test",
       description: "Replies with Pong!"
    },
    {
       name: "omikuji",
       description: "おみくじで今日の運勢をためそう!!! コード提供"
    },
    {
        name: "ping",
        description: "botとのping値を計測します コードは提供してもらいました"
    },
    {
      name: "afk",
      description: "今はいってるVCから抜けることができます"
    },
    {
      name: "help",
      description: "しらすbotに関する情報が見られます"
    },
    {
      name: "dhelp",
      description: "技術的な情報が見られます"
    }
  ];
  await client.application.commands.set(data);
  console.log("Ready!");
},)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
      return;
  }
  if (interaction.commandName === 'test') {
    message.channel.send('組み分けはココじゃ', button);
  }
  if (interaction.commandName === 'omikuji') {
    const omikujin = ["大吉", "中吉", "吉","末吉","小吉"]
await interaction.reply(omikujin[Math.floor(Math.random() * omikujin.length)]);

  }
  if (interaction.commandName === 'afk') {
    interaction.member.voice.setChannel(null)
    const embed = new EmbedBuilder()
    .setTitle("VCから抜けてしまいました")
    .setDescription(`みんなも適度にVCをしようね`)
    .setColor('#f39800')
    await interaction.channel.send({ embeds: [embed] });
  }
  if (interaction.commandName === 'help'){
    const embed = new EmbedBuilder()
    .setTitle("しらすbot")
    .setDescription(`Gen_z_webが提供支援する高機能bot\nコマンド一覧\n /omikuji おみくじが引けます \n /afk afkというVCがあればafkに移動なければVCから退出させられます`)
    .setColor('#f39800')
    await interaction.channel.send({ embeds: [embed] });
  }
  const data = {
    "quiz": {
        func: interaction => {
            const quiz = [
                {
                    "q": "12gの食塩と水288gを混ぜると何%の食塩水ができますか？",
                    "a": "4"
                },
                {
                    "q": "「おもりの重さ」が1000gで、「ふりこの周期」を10.0秒にするためには、「ふりこの長さ」は何mにすればよいでしょうか？",
                    "a": "25"
                }
            ]
            if (interaction.options.getSubcommand() === "question") {
                temp[interaction.user.id] = Math.floor(Math.random() * quiz.length - 1)
                interaction.reply(quiz[temp[interaction.user.id]].q)
            } else {
                if (temp[interaction.user.id] === null || temp[interaction.user.id] === undefined) 
                    return interaction.reply({ content: "問題が提出されていません。\n一度`/quiz question`をしましょう。", ephemeral: true })
                if (quiz[temp[interaction.user.id]].a === interaction.options.getString("answer"))
                    interaction.reply("正解です！")
                    /* 「正解です！」の後に式とかを貼ると、ちょっとかっこいい... */
                else {
                    interaction.reply("不正解です...答えは「" + quiz[temp[interaction.user.id]].a + "」です。")
                }
                temp[interaction.user.id] = null
            }
        },
        command: new SlashCommandBuilder()
            .setDescription("問題コマンド")
            .addSubcommand(subcommand => subcommand
                .setName("question")
                .setDescription("問題を出す際に使用します。")
            )
            .addSubcommand(subcommand => subcommand
                .setName("answer")
                .setDescription("答えを出す際に使用します。")
                .addStringOption(option => option
                    .setName("answer")
                    .setDescription("答えを入力")
                    .setRequired(true)
                )
            )
    }
}

client.on(Events.ClientReady, () => {
  const commands = []
  //これを使ってコマンドにsetName()をし、コマンド名を割り当てる。
  for (let i = 0; i !== Object.keys(data).length; i++) {
      data[Object.keys(data)[i]].command.setName(Object.keys(data)[i])
      commands.push(data[Object.keys(data)[i]].command)
  }
  client.application.commands.set(commands)

  //久々のコードだから、ミスってるかもしれん
})

client.on(Events.InteractionCreate, interaction => {
    console.log(interaction.commandName)
    data[interaction.commandName].func(interaction)
})



       

  if (interaction.commandName === 'ping'){
      const apiPing = Date.now() - interaction.createdTimestamp//ping取得
          await interaction.reply({//ping送信
              embeds: [
                  new EmbedBuilder()
                  .setTitle(":ping_pong:Pong!")
                  .setDescription("Ping値を表示します。")
                  .addFields(
                      {
                          name: ":electric_plug:WebSocket Ping",
                          value: "`" + client.ws.ping + "ms`"
                      },
                      {
                          name: ":yarn:API Endpoint Ping",
                          value: "`" + apiPing + "ms`"
                      },
                      {
                          name: "コード提供\nバレンシア・ベネツィア#8782",
                          value: "**thank you**"
                      }
                  )
                  .setColor("#2f3136")
                  .setTimestamp()
              ],
              components: [//コマンド削除ボタン
                  new ActionRowBuilder()
                  .addComponents(
                      new ButtonBuilder()
                      .setLabel("🗑️削除")
                      .setStyle(ButtonStyle.Danger)
                      .setCustomId("delete")
                  )
              ]
          })
  
  }
});
module.exports = {
  data: new SlashCommandBuilder() 
      .setName("ping")
      .setDescription("Ping値を測定"),

  async execute(i, client) {
      const apiPing = Date.now() - i.createdTimestamp//ping取得
          await i.reply({//ping送信
              embeds: [
                  new EmbedBuilder()
                  .setTitle(":ping_pong:Pong!")
                  .setDescription("Ping値を表示します。")
                  .addFields(
                      {
                          name: ":electric_plug:WebSocket Ping",
                          value: "`" + client.ws.ping + "ms`"
                      },
                      {
                          name: ":yarn:API Endpoint Ping",
                          value: "`" + apiPing + "ms`"
                      }
                  )
                  .setColor("#2f3136")
                  .setTimestamp()
              ],
              components: [//コマンド削除ボタン
                  new ActionRowBuilder()
                  .addComponents(
                      new ButtonBuilder()
                      .setLabel("🗑️削除")
                      .setStyle(ButtonStyle.Danger)
                      .setCustomId("delete")
                  )
              ]
          })
  },
}

process.on("exit", exitCode => {
  console.log(cmdexec)
  console.log("botが実行されているときに起きた暴言等は" + counta + "回です")
});
process.on("SIGINT", () => process.exit(0));
client.login(process.env.token)
client.on('ready', () => {
  const embed = new EmbedBuilder()
    .setTitle('起動中...')
    .setDescription(`起動完了！`)
    .setURL("https://discordapp.com")
    .setThumbnail('http://www.raceentry.com/img/map/loading.gif')
    .setColor('#f39800')
  
})