const express = require("express")
const { Client, GatewayIntentBits, Partials } = require("discord.js")

const client = new Client({
    intents: [
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
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
    ],
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ]
})

const data = {
    token: ""
}

const app = express()

app.get("*", async (req, res) => {
    if (req.url === "/") {
        res.writeHead(200, {
            "Content-Type": "plain;charset=utf-8"
        })
        res.end("index.html")
    }
})

app.post("*", async (req, res) => {
    let request = ""
    req.on("data", chunk => request += chunk)
    req.on("end", () => {
        const json = JSON.parse(request)
        if (json.req === "login") client.login(data.token)
        else if (json.req === "setToken") {
            data.token = json.token
            res.end()
        } else if (json.req === "sendMessage") {
            client.channels.cache.get(json.channelId).send(json.message)
            res.end()
        } else if (json.req === "getServer") {
            let guildIds = []
            client.guilds.cache.map(guild => {
                guildIds.push(guild.id)
            })
            res.end(JSON.stringify(guildIds))
        } else if (json.req === "") {
            
        }
    })
})
