import Discord from "discord.js"
import EventEmitter from "events"

import dataIO from "./dataIO"
/**
 * Discordのクライアントクラスやそれに関するデータ、例でいう可変するVCの利用状況などに常にアクセスできるように作成された関数です。
 */
export interface discordRealTimeData {
    name: string,
    client?: Discord.Client,
    status?: {
        logined?: boolean
    },
    program?: {
        [programName: string]: discordProgram
    }
}
/**
 * これらのイベントが利用できます。
 */
interface discordBotEvents {
    classReady: [void]
    djsClientReady: [Discord.Client]
    messageCreate: [Discord.Message]
    interactionCreate: [Discord.Interaction]
    error: [Error]
}
/**
 * Discordのメイン
 */
export declare interface discordBot {
    on<K extends keyof discordBotEvents>(s: K, listener: (...args: discordBotEvents[K]) => any): this
    emit<K extends keyof discordBotEvents>(eventName: K, ...args: discordBotEvents[K]): boolean
}
/**
 * Botを管理するために使用するJSONの型定義です。
 */
interface discordData {
    [botName: string]: {
        programs?: string[],
        token?: string,
        clientOptions?: Discord.ClientOptions
    }
}
/**
 * JSON型定義の上書き
 */
interface discordDataIOextJSON extends dataIO {
    json: discordData
}
interface discordProgram {
    message?: (message: Discord.Message) => Promise<void>,
    interaction?: (interaction: Discord.Interaction) => Promise<void>,
    slashCommand?: Omit<Discord.SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand" | "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">[]
}
export class discordBot extends EventEmitter {
    /**
     * バッググラウンドで動作するために一時的に参照する固定の変数です。ここにVCや状態を書き込みます。
     */
    rtdata: discordRealTimeData
    /**
     * 保存するために入力します。
     */
    data: discordDataIOextJSON
    /**
     * @param data bot名のみを入れます。すると、class内で自動的にデータを読み込みます。
     */
    constructor(data: discordRealTimeData) {
        super()
        this.rtdata = data
        if (!this.rtdata.status) this.rtdata.status = {}
        this.pconst().then(() => this.emit("classReady"))
    }
    static async initer(data: discordRealTimeData) {
        return await new Promise<discordBot>(resolve => {
            const djs = new discordBot(data)
            djs.on("classReady", () => resolve(djs))
        })
    }
    static async data() {
        const data = await dataIO.initer("discordBot")
        if (!data) return null
        const json: discordData = data.json

        return <discordData>JSON.parse(JSON.stringify(json))
    }
    private async pconst() {
        const { GatewayIntentBits, Partials } = Discord
        const newClientOption = {
            intents: [
                GatewayIntentBits.AutoModerationConfiguration,
                GatewayIntentBits.AutoModerationExecution,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.DirectMessages,
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
        }
        const data = await dataIO.initer("discordBot")
        if (!data) {
            const e = new ReferenceError()
            e.message = "dataIOの準備ができませんでした。"
            e.name = "Discord Bot"
            this.emit("error", e)
            return
        }
        this.data = data
        if (!this.data.json[this.rtdata.name]) this.data.json[this.rtdata.name] = {}
        if (!this.rtdata.client) {
            const json = this.data.json[this.rtdata.name]
            this.rtdata.client = new Discord.Client(json.clientOptions !== undefined ? json.clientOptions : newClientOption)
            const client = this.rtdata.client
            client.on(Discord.Events.MessageCreate, async message => {
                if (this.rtdata.program) {
                    const programStrings = Object.keys(this.rtdata.program)
                    for (let i = 0; i !== programStrings.length; i++) {
                        const program = this.rtdata.program[programStrings[i]]
                        if (program.message) await program.message(message)
                    }
                }
            })
            client.on(Discord.Events.InteractionCreate, async interaction => {
                if (this.rtdata.program) {
                    const programStrings = Object.keys(this.rtdata.program)
                    for (let i = 0; i !== programStrings.length; i++) {
                        const program = this.rtdata.program[programStrings[i]]
                        if (program.interaction) await program.interaction(interaction)
                    }
                }
            })
        }
        const client = this.rtdata.client
        client.on(Discord.Events.ClientReady, client => {
            this.emit("djsClientReady", client)
        })
        client.on(Discord.Events.MessageCreate, message => {
            this.emit("messageCreate", message)
        })
        client.on(Discord.Events.InteractionCreate, interaction => {
            this.emit("interactionCreate", interaction)
        })
        await this.data.save()
        await this.programSeting()
    }

    private programs: {
        [programName: string]: discordProgram
    } = {
            "簡易認証": {
                interaction: async interaction => {
                    interface ttts {
                        buttoncreate: {
                            roleId: string
                            question: boolean
                        }
                        calc: {
                            roleId: string
                            buttonNum: number
                            calcType: number
                        }
                    };
                    type ttt = {
                        type: "buttoncreate",
                        data: {
                            roleId: string,
                            question: boolean
                        }
                    } | {
                        type: "calc",
                        data: {
                            roleId: string,
                            buttonNum: number,
                            calcType: number
                        }
                    };
                    if (interaction.isChatInputCommand()) {
                        if (interaction.channel && interaction.channel.isTextBased() && !interaction.channel.isVoiceBased() && !interaction.channel.isThread() && !interaction.channel.isDMBased() && interaction.guild) {
                            const name = interaction.commandName
                            if (name === "buttoncreate") {
                                const member = (await interaction.guild.members.fetch()).get(interaction.user.id)
                                if (member && member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
                                    const role = interaction.options.getRole("roles")
                                    const question = interaction.options.getBoolean("question")
                                    const title = interaction.options.getString("title")
                                    const description = interaction.options.getString("description")
                                    if (role === null || question === null) {
                                        interaction.channel.send("必要なデータが不足または破損してしまっているようです。最初からやり直してください。")
                                        return
                                    }
                                    const data: ttt = {
                                        type: "buttoncreate",
                                        data: {
                                            roleId: role.id,
                                            question: question
                                        }
                                    }
                                    const components = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
                                        .addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel("認証！")
                                                .setStyle(Discord.ButtonStyle.Primary)
                                                .setCustomId(JSON.stringify(data))
                                        )
                                    const iconURL = interaction.guild.iconURL()
                                    const embed = new Discord.EmbedBuilder()
                                        .setTitle(title || "認証をして僕たちとこのサーバーを楽しもう！")
                                        .setDescription(description || "✅認証は下のボタンを押下する必要があります。")
                                        .setAuthor({
                                            name: interaction.guild.name,
                                            iconURL: iconURL ? iconURL : undefined
                                        })
                                    try {
                                        await interaction.channel.send({ embeds: [embed], components: [components] })
                                        await interaction.reply({ content: "作成が完了しました！", ephemeral: true })
                                    } catch (e) {
                                        interaction.reply({
                                            content: "エラーが確認されました。: `" + e.code + "/" + e.message,
                                            ephemeral: true
                                        })
                                    }
                                } else {
                                    await interaction.reply({ content: "コマンド発行者自身に管理者権限がないため、実行することが出来ません..." })
                                }
                            }
                        }
                    }
                    if (interaction.isButton()) {
                        const customId = interaction.customId
                        const data = ((): ttt | null => {
                            try { return JSON.parse(customId) }
                            catch (e) { return null } //JSONではない文字列の場合nullを返す
                        })()
                        let roleGive: { give: boolean, roleId: string | null } = {
                            give: false,
                            roleId: null
                        }
                        if (data !== null)
                            if (data.type === "buttoncreate") {
                                const { roleId, question } = data.data
                                if (question) {
                                    const embed = new Discord.EmbedBuilder();
                                    const num: number[] = []
                                    for (let i = 0; i !== 2; i++) num.push(Math.floor(Math.random() * 9))
                                    const ord: { type: string, Num: number }[] = []
                                    ord.push({ type: "+", Num: num[0] + num[1] })
                                    ord.push({ type: "-", Num: num[0] - num[1] })
                                    ord.push({ type: "x", Num: num[0] * num[1] })
                                    const answer = Math.floor(Math.random() * ord.length - 1)
                                    for (let i = 0; i !== ord.length - 1; i++) {
                                        const random = Math.floor(Math.random() * i)
                                        const tmp = ord[i]
                                        ord[i] = ord[random]
                                        ord[random] = tmp
                                    }
                                    embed.setTitle("問題！")
                                    embed.setDescription("下の計算を解くだけで認証が出来ます！")
                                    embed.addFields({
                                        name: num[0] + ord[answer].type + num[1] + "=",
                                        value: "の答えを下から選びましょう。"
                                    })
                                    const components = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
                                    for (let i = 0; ord.length != i; i++) {
                                        const data: ttt = {
                                            type: "calc",
                                            data: {
                                                roleId: roleId,
                                                buttonNum: i,
                                                calcType: answer
                                            }
                                        }
                                        components.addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel(String(ord[i].Num))
                                                .setStyle(Discord.ButtonStyle.Primary)
                                                .setCustomId(JSON.stringify(data))
                                        )
                                    }
                                    interaction.reply({
                                        embeds: [embed],
                                        components: [components],
                                        ephemeral: true
                                    })
                                } else roleGive = { give: true, roleId: roleId }
                            } else if (data.type === "calc") {
                                const { roleId, buttonNum, calcType } = data.data
                                if (buttonNum === calcType) roleGive = { give: true, roleId: roleId }
                                else interaction.reply({
                                    content: "あぁ...答えが違いますよ...\nもっかいクリックしてやりなおしましょ！",
                                    ephemeral: true
                                })
                            }
                        if (roleGive.give && roleGive.roleId !== null && interaction.channel) {
                            try {
                                if (interaction.guild) {
                                    const member = interaction.guild.members.cache.get(interaction.user.id)
                                    const role = await interaction.guild.roles.fetch(roleGive.roleId)
                                    if (member && role) member.roles.add(role)
                                } else {
                                    interaction.reply({
                                        content: "",
                                        ephemeral: true
                                    })
                                }
                            }
                            catch (e) {
                                if (e.code) {
                                    interaction.reply({
                                        content: "エラー確認: " + e.code + "\nこのエラーコードを管理人に報告してくれると、一時的に対処が行われます。",
                                        ephemeral: true
                                    })
                                } else {
                                    interaction.reply({
                                        content: "認証でエラーが発生してしまいました...\nエラーは管理者が確認し修正します。",
                                        ephemeral: true
                                    })
                                }
                            }
                        }
                    }
                },
                slashCommand: [
                    new Discord.SlashCommandBuilder()
                        .setName("buttoncreate")
                        .setDescription("認証ボタンを作成します。")
                        .addRoleOption(option => option
                            .setName("roles")
                            .setDescription("付与する際に使用するロールを選択します。")
                            .setRequired(true)
                        )
                        .addBooleanOption(option => option
                            .setName("question")
                            .setDescription("認証をクリックした際に、計算問題を出すかどうかを決めます(通常は有効)")
                        )
                        .addStringOption(option => option
                            .setName("title")
                            .setDescription("埋め込みのタイトルを決めます。")
                        )
                        .addStringOption(option => option
                            .setName("description")
                            .setDescription("埋め込みの説明を決めます。")
                        ),
                    new Discord.SlashCommandBuilder()
                        .setName("multirolebtn")
                        .setDescription("複数役職を付与したい場合に使用します。")
                        .addStringOption(option => option
                            .setName("roleids")
                            .setDescription("ロールIDをスペースで区切り、それを使用し複数ロールの付与をします。")
                            .setRequired(true)
                        )
                        .addStringOption(option => option
                            .setName("title")
                            .setDescription("埋め込みのタイトルを決めます。")
                        )
                        .addStringOption(option => option
                            .setName("description")
                            .setDescription("埋め込みの説明を決めます。")
                        )
                ]
            }
        }

    async token(token: string) {
        this.data.json[this.rtdata.name].token = token
        await this.data.save()
    }
    private async programSeting() {
        const progs = this.data.json[this.rtdata.name].programs
        if (progs)
            for (let i = 0; i !== progs.length; i++) {
                if (this.rtdata.program && !this.rtdata.program[progs[i]]) {
                    this.rtdata.program[progs[i]] = this.programs[progs[i]]
                }
            }
    }
    async login() {
        if (!this.rtdata.status) return
        if (!this.rtdata.client) return
        const token = this.data.json[this.rtdata.name].token
        if (!token) return
        this.rtdata.status.logined = true
        await this.rtdata.client.login(token)
    }
}
export function mentionIs(mentions: Discord.MessageMentions<boolean>, client?: Discord.Client<boolean>) {
    const mainClient = client ? client : mentions.client
    if (mainClient.user) {
        if (mentions.users.has(mainClient.user.id)) return true
        if (mentions.roles.some(r => { if (mainClient.user) return [mainClient.user.username].includes(r.name) })) return true
    }
    return false
}
export default discordBot
