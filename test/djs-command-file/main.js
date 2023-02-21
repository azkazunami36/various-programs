const { Client, GatewayIntentBits, Partials, SlashCommandBuilder, Interaction, Events } = require("discord.js")
const fs = require("fs")
const client = new Client({})
/**
 * コマンドデータを関数が入ったものです。
 * @type {{[commandName: string]: {config: {name: string}, function: (interaction: Interaction) => Promise<void>, ignore: boolean}}}
 */
const commands = {}

for (const filename of fs.readdirSync('./commands').filter(file => file.endsWith('.js'))) { //commandsフォルダ内のファイルを読み込み、jsファイルに絞る
    /**
     * @type {{config: {name: string}, function: (interaction: Interaction) => Promise<void>, ignore: boolean}}
     */
    const command = require("./commands/" + filename)
    if (!command.ignore) commands[command.config.name] = command //コマンド名をオブジェクト名にします。
}

client.on(Events.ClientReady, () => {
    //即時関数を利用し、コマンドをセットします。
    client.application.commands.set((() => {
        const command = []
        for (const cmdName of commands) command.push(commands[cmdName])
        return command
    })())
})
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isCommand()) {
        const command = commands[interaction.commandName] //オブジェクト名がコマンド名なので、必然的にコマンドと一致させるifと同等の動きになります。
        try { await command.function(interaction) } //コールバック関数を知っていますか？その仕組みだと思えばいいと思われます。
        catch (e) { //エラー発生時に
            console.log("エラーです。", e)
            await interaction.reply({
                content: "内部エラーが発生し、プログラムを中断しました。",
                ephemeral: true
            })
        }
    }
})
