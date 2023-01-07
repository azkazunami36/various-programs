const { Client, GatewayIntentBits, Message, EmbedBuilder, ActionRowBuilder, DataResolver, ButtonBuilder, ButtonStyle,} = require('discord.js');
require("dotenv").config();
const { entersState, AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel,  StreamType } = require('@discordjs/voice');
let jsonFile = require('jsonfile');
const ytdl = require("ytdl-core");
const ytpl = require("ytpl")
require('date-utils');
const sharp = require('sharp')
var async = require('async'); //このようなパッケージは存在しない
let cmdexec = 0;
let ari = 0;
let countb = 0;
const data = require("./data.json") //data.json
const {
  entersState,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
  AudioPlayerStatus
} = require("@discordjs/voice")
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

//sharpの連続コードをforで改善
const imageCount = 16;
for (let i = 0; i != imageCount; i++) {
  sharp("data/" + i + ".jpg")
    .resize(512)
    .toFile("data/" + i + "_0.jpg", (err,info) => {
      if(err){
        throw err
      }
      console.log(info)
    })
}

//権限//

const client = new Client(
  {
    partials: [
      Partials.Channel,
      Partials.GuildMember,
      Partials.User
    ],
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
        if (message.content === (data.data[i])) { //マッチする言葉を探して
          console.log(data.data[i] + "とマッチしました")
          idiotis = true
          const username = message.author.username
          const black = message.author.id
          client.users.cache.get(black).send('貴方は暴言等を発言したためブラックリストに入りました')
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
client.on(Events.MessageCreate, async message => {
  if (message.content.startsWith("!yt")) {
      if (message.member.voice.channel) return message.reply("先にボイスチャットに参加してください！")
      const channel = message.member.voice.channel

      let videoId = message.content.split(" ")[1]
      const ytdlURL = ytdl.validateURL(videoId)
      const ytdlID = ytdl.validateID(videoId)
      if (ytdlURL) videoId = ytdl.getVideoID(videoId)
      if (!ytdlURL && !ytdlID) {
          console.log("VideoID検索で次の文字列は該当しませんでした。: " + videoId)
          const data = await yts({ query: videoId })
          if (data.videos[0]) videoId = data.videos[0].videoId
          else return message.reply("動画が見つかりませんでした！")
      }
      const connection = joinVoiceChannel({
          guildId: message.guild.id,
          channelId: channel.id,
          adapterCreator: message.guild.voiceAdapterCreator,
          selfDeaf: true
      })
      connection.on("error", async e => {
          console.log("予想外の通信エラーが発生しました。", e,
              "\nこのエラーが何か具体的に記されている場合、エラーをGiuHubのIssuesにお送りください。")
      })
      const player = createAudioPlayer()
      connection.subscribe(player)
      const stream = ytdl(plist[channeldata.playing].url, {
          filter: "audioonly",
          quality: "highest", highWaterMark: 1 * 1e6
      });
      const resource = createAudioResource(stream, { inputType: StreamType.WebmOpus, inlineVolume: true })
      resource.volume.setVolume(0.5)
      player.play(resource)
      await entersState(player, AudioPlayerStatus.Playing);
      await entersState(player, AudioPlayerStatus.Idle);
      connection.destroy()
  }
})
process.on("exit", exitCode => {
  console.log(cmdexec)
  console.log("botが実行されているときに起きた暴言等は" + counta + "回です")
});
process.on("SIGINT", () => process.exit(0));
client.login(process.env.token)
