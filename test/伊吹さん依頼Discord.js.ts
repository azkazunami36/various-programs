import { Client, GatewayIntentBits, Partials, Events } from "discord.js"

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages
    ]
})

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return
    /** ここにDMで送り返してほしい文字列を入力する */
    const sendMessages = [
        "テスト"
    ]
    for (let i = 0; i !== sendMessages.length; i++) if (message.content.match(sendMessages[i])) {
        const user = await client.users.fetch("1055399666587545620")
        if (user) user.send(message.content)
        break
    }
})

client.login("")
