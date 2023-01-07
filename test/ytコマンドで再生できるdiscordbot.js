const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
} = require("discord.js")
const {
    entersState,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    StreamType,
    AudioPlayerStatus
} = require("@discordjs/voice")
const ytdl = require("ytdl-core")
const yts = require("yt-search")
const client = new Client({
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.User
    ],
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ]
});

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
client.login(process.env.token)
