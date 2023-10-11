import Discord from "discord.js"
import VoDiscord from "@discordjs/voice"
import ytdl from "ytdl-core"
import ytpl from "ytpl"
import yts from "yt-search"
import ytch from "yt-channel-info"
import fs from "fs"
import readline from "readline"

import time from "../../ts-library/time"

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

/**
 * 主にデータ管理をするために利用します。要するに、データベースに変更を加えるときはこちらのクラスを利用してください。
 * 再生中などの状況を書き込めます。VCが数多くある場合、クラスを複数生成してください。
 */
const musicDatabase = class {
    constructor(data: { musicURLList: string[], playing: number }) { }
    musicURLList: string[] = []
    playing: number = 0
    /**
     * 曲を追加します。
     * @param url YouTubeのURL、タイトルやプレイリストURLを入力
     * @param no 要求があれば追加場所を指定
     * @returns 操作が完了したかを返します。
     */
    async add(url: string, no: number): Promise<boolean> {
        return false
    }
    /**
     * クラスの現在のデータ状況を確認できます。
     */
    get JSON() {
        return {
            musicURLList: this.musicURLList, playing: this.playing
        }
    }
}

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return //Bot回避は当たり前
    if (message.content.startsWith("voice!") && message.guild && message.member && message.member.voice.channel) { //すべてのデータが存在することを確認してから
        const content = message.content
        const guildId = message.guild.id
        const vcId = message.member.voice.channel.id
        const authorId = message.author.id
        const voiceAdapterCreator = message.guild.voiceAdapterCreator
        /**
         * スペースで区切られています。連続スペースによるバグには対応していません。
         * コマンドとして利用可能で、「voice!play https://...」は["play", "https://..."]となります。
         */
        const arg: string[] = (() => {
            const contentSplited = message.content.split("!")
            let reContented = ""
            for (let i = 1; i !== contentSplited.length; i++) reContented += contentSplited[i]
            return reContented.split(" ")
        })()
        const youtubeClass = new class {
            /**
             * URLが利用可能だったらVideoID出力、そうでない場合指定がないと検索してVideoID出力、見つからない場合はNullを返すプログラムです。
             */
            async checkURL(inputStr: string, search?: boolean): Promise<{
                /**
                 * 結果的にここで入力されたデータのタイプを出力します。
                 */
                inputType: "VideoID" | "URL" | "String" | "Unknown",
                /**
                 * 11桁となるVideoIDを出力します。
                 */
                videoId: string | null
            }> {

                if (!inputStr) return {
                    inputType: "Unknown",
                    videoId: null
                }
                return {
                    inputType: "Unknown",
                    videoId: null
                }
            }
        }()
        const program: { name: string, func: () => void }[] = [
            {
                name: "add",
                func: () => {

                }
            }
        ]
    }
})

client.login("")
