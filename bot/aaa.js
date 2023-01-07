const { Client, GatewayIntentBits, Message, EmbedBuilder, ActionRowBuilder, DataResolver, ButtonBuilder, ButtonStyle, } = require('discord.js');
require("dotenv").config();
require('date-utils');
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
  if (message.content === "あけましておめでとうございます"){
    message.reply("あけおめ～ことよろ～")
  }
})
client.login(process.env.token)