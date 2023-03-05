const { Client, GatewayIntentBits, Partials, Events, Interaction, SlashCommandBuilder } = require("discord.js")
const client = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ],
    partials: [
        Partials.Message
    ]
})
const fs = require("fs")
if (fs.existsSync(".env")) require("dotenv").config() //.envファイルがある場合、dotenvモジュールを利用します。

const temp = {}

/**
 * ここにデータの他にプログラムも入れることが出来る。
 * @type {{[programName: string]: { func: (interaction: Interaction) => void, command: SlashCommandBuilder } }}
 */
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
client.login(process.env.TOKEN)