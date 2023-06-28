import Discord from "discord.js"
import VoDiscord from "@discordjs/voice"
import ytdl from "ytdl-core"
import ytpl from "ytpl"
import fs from "fs"
import readline from "readline"

import time from "ts-library/time"

const { Client, GatewayIntentBits, Partials, Events, EmbedBuilder } = Discord
const { entersState, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType, AudioPlayerStatus } = VoDiscord

require("dotenv").config()

const client = new Client({
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ],
    intents: [
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildModeration,
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

client.on(Events.ClientReady, client => {

})

const musicDatabase = class {
    constructor() {}
    musicURLList: string[] = []
    /**
     * 曲を追加します。
     * @param url YouTubeのURL、タイトルやプレイリストURLを入力
     * @param no 要求があれば追加場所を指定
     */
    add(url: string, no: number) {

    }
}

client.on(Events.MessageCreate, message => {
    if (message.author.bot) return
})

client.login("")