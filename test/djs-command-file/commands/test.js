const { SlashCommandBuilder, Interaction } = require("discord.js")
module.exports = {
    config: new SlashCommandBuilder()
        .setName("ping")
    ,
    /**
     * @param {Interaction} interaction 
     */
    function: async interaction => {
        await interaction.reply("pong!")
    },
    ignore: true //ファイル読み込みをスキップするかどうか
}
