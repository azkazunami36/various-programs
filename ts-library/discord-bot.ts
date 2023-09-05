import Discord from "discord.js"
import EventEmitter from "events"

import dataIO from "./dataIO.js"
import handyTool from "./handyTool.js"
/**
 * Discordのクライアントクラスやそれに関するデータ、例でいう可変するVCの利用状況などに常にアクセスできるように作成された関数です。
 * ユーザーが不正に書き込んだりプログラムでむやみに操作しないようにしてください。エラーが発生したり重複が起こったり可能性があります。
 */
export interface discordRealTimeData {
    /**
     * Botの名前を入力します。
     */
    name: string,
    /**
     * DiscordのClientクラスが入ります。Botの状態にアクセスするにはここからアクセスすることができます。
     */
    client?: Discord.Client,
    /**
     * ステータスです。
     */
    status?: {
        /**
         * Botが動作中かどうかを確認できます。
         */
        logined?: boolean
    },
    /**
     * 利用するプログラムが格納されます。
     */
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
interface discordDataIOextJSON extends dataIO.dataIO {
    json: discordData
}
/**
 * botの動作に利用できるプログラムや情報を入力します。
 */
interface discordProgram {
    /**
     * messageイベントを受信し、処理するためのものです。
     * @param message イベントを受信します。
     * @returns 
     */
    message?: (message: Discord.Message) => Promise<void>,
    /**
     * messageイベントを受信し、処理するためのものです。
     * @param interaction イベントを受信します。
     * @returns 
     */
    interaction?: (interaction: Discord.Interaction) => Promise<void>,
    /**
     * スラッシュコマンドを登録できます。
     */
    slashCommand?: Omit<Discord.SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand" | "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">[]
}
/**
 * DiscordのBotを動かすためのクラスです。１つのクラスにつき1つまでのbotを稼働できます。
 * initerを使ったクラスの利用をお勧めします。クラスを削除しても、リアルタイムデータを入力すると再度操作が可能になります。
 * 
 * 利用方法。initerに次のようなJSONを入力します。
 * ```ts
 * discordBot.initer({ name: "Botの名前" })
 * ```
 * その後はtoken関数を使い、トークンを入力します。
 */
export class discordBot extends EventEmitter {
    /**
     * バッググラウンドで動作するために一時的に参照する固定の変数です。ここにVCや状態を書き込みます。
     */
    private rtdata: discordRealTimeData
    /**
     * 保存するために入力します。
     */
    private data: discordDataIOextJSON
    /**
     * @param data bot名のみを入れます。すると、class内で自動的にデータを読み込みます。
     */
    constructor(data: discordRealTimeData) {
        super()
        this.rtdata = data;
        (async () => {
            if (!this.rtdata.status) this.rtdata.status = {}
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
            const data = await dataIO.dataIO.initer("discordBot")
            if (!data) {
                const e = new ReferenceError()
                e.message = "dataIOの準備ができませんでした。"
                e.name = "Discord Bot"
                this.emit("error", e)
                return
            }
            this.data = data
            // JSONにBotの名前が存在しなかったら追加します。
            if (!this.data.json[this.rtdata.name]) this.data.json[this.rtdata.name] = {
                programs: [],
                token: ""
            }
            // リアルタイムデータ内のprogramを初期化します。
            this.rtdata.program = {}
            //リアルタイムデータ内に関数を保存します。
            await this.programSeting()
            const th = this
            // ClientにBotのデータが入っていない場合は設定します。
            if (!this.rtdata.client) {
                /**
                 * dataIOのJSONに入ったBotのデータを定義
                 */
                const json = this.data.json[this.rtdata.name]
                /**
                 * Discord.jsの準備
                 */
                this.rtdata.client = new Discord.Client(json.clientOptions !== undefined ? json.clientOptions : newClientOption)
                const client = this.rtdata.client
                client.on(Discord.Events.MessageCreate, async message => {
                    /**
                     * リアルタイムプログラム内に関数が入っていれば
                     */
                    if (th.rtdata.program) {
                        const programStrings = Object.keys(th.rtdata.program)
                        /**
                         * 利用するとされているプログラムを実行
                         */
                        for (let i = 0; i !== programStrings.length; i++) {
                            const program = th.rtdata.program[programStrings[i]]
                            if (program.message) await program.message(message)
                        }
                    }
                })
                client.on(Discord.Events.InteractionCreate, async interaction => {
                    /**
                     * リアルタイムプログラム内に関数が入っていれば
                     */
                    if (th.rtdata.program) {
                        const programStrings = Object.keys(th.rtdata.program)
                        /**
                         * 利用するとされているプログラムを実行
                         */
                        for (let i = 0; i !== programStrings.length; i++) {
                            const program = th.rtdata.program[programStrings[i]]
                            if (program.interaction) {
                                await program.interaction(interaction)
                            }
                        }
                    }
                })
            }
            const client = this.rtdata.client
            client.on(Discord.Events.ClientReady, client => {
                th.emit("djsClientReady", client)
                client.application.commands.set((() => {
                    const program = th.rtdata.program
                    if (!program) return []
                    const keys = Object.keys(program)
                    let data: Omit<Discord.SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand" | "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">[] = []
                    for (let i = 0; i !== keys.length; i++) {
                        const slashCommands = program[keys[i]].slashCommand
                        if (slashCommands) for (let i = 0; i !== slashCommands.length; i++) data.push(slashCommands[i])
                    }
                    return data
                })())
            })
            client.on(Discord.Events.MessageCreate, message => {
                th.emit("messageCreate", message)
            })
            client.on(Discord.Events.InteractionCreate, interaction => {
                th.emit("interactionCreate", interaction)
            })
            await this.data.save()
        })()
        this.emit("classReady")
    }
    /**
     * クラスを安定的に初期化します。おすすめです。
     * @param data 
     * @returns 
     */
    static async initer(data: discordRealTimeData) {
        const djs = new discordBot(data)
        await new Promise<void>(resolve => djs.on("classReady", () => resolve()))
        return djs
    }
    /**
     * 全てのDiscord Botに関するデータを読み込みます。
     * @returns データを返します。
     */
    static async outputJSON() {
        const data = await dataIO.dataIO.initer("discordBot")
        if (!data) return
        const json: discordData = data.json

        return <discordData>JSON.parse(JSON.stringify(json))
    }
    /**
     * Discord Botで利用できる専用プログラムです。
     */
    private programs: {
        [programName: string]: discordProgram
    } = {
            "簡易認証": {
                interaction: async interaction => {
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
                    } | {
                        type: "multirole",
                        data: {
                            roleId: string
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
                                    if (role === null) {
                                        await interaction.reply({ content: "必要なデータが不足または破損してしまっているようです。最初からやり直してください。", ephemeral: true })
                                        return
                                    }
                                    const data = {
                                        type: "buttoncreate",
                                        data: {
                                            roleId: role.id,
                                            question: question ? true : false
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
                            } else if (name === "multirolebtn") {
                                const member = (await interaction.guild.members.fetch()).get(interaction.user.id)
                                if (member && member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
                                    const roleIDs = (() => {
                                        const roleString = interaction.options.getString("roleids")
                                        if (roleString) return roleString.split(" ")
                                        return
                                    })()
                                    const title = interaction.options.getString("title")
                                    const description = interaction.options.getString("description")
                                    const roles = await (async () => {
                                        const roles: Discord.Role[] = []
                                        if (!roleIDs) return roles;
                                        for (let i = 0; i !== roleIDs.length; i++) {
                                            if (interaction.guild !== null) {
                                                const role = await interaction.guild.roles.fetch(roleIDs[i])
                                                if (role) roles.push(role)
                                            }
                                        }
                                        return roles
                                    })()
                                    if (roles.length === 0) {
                                        await interaction.reply("有効なロールIDがありません。もう一度指定してください。");
                                        return
                                    }
                                    const components = new Discord.ActionRowBuilder<Discord.ButtonBuilder>();
                                    let roleNameStr = description || "既にロールが付いた状態でもう一度押すと、ロールを外すことが出来ます。"
                                    for (let i = 0; i !== roles.length; i++) {
                                        const data = {
                                            type: "multirole",
                                            data: {
                                                roleId: roles[i].id
                                            }
                                        }
                                        components.addComponents(
                                            new Discord.ButtonBuilder()
                                                .setLabel(String(i + 1))
                                                .setStyle(Discord.ButtonStyle.Primary)
                                                .setCustomId(JSON.stringify(data))
                                        )
                                        roleNameStr += "\n[" + (i + 1) + "] " + roles[i].name
                                    }
                                    const iconURL = interaction.guild.iconURL()
                                    const embed = new Discord.EmbedBuilder()
                                        .setTitle(title || "下の一覧から数字を選んで、自由なロールを付けよう！")
                                        .setDescription(roleNameStr)
                                        .setAuthor({
                                            name: interaction.guild.name,
                                            iconURL: iconURL ? iconURL : undefined
                                        })
                                    try {
                                        await interaction.channel.send({ embeds: [embed], components: [components] })
                                        await interaction.reply({ content: "作成が完了しました！", ephemeral: true })
                                    } catch (e) {
                                        await interaction.reply({
                                            content: "エラーが確認されました。: `" + e.code + "/" + e.message,
                                            ephemeral: true
                                        })
                                    }
                                } else interaction.reply({ content: "コマンド発行者自身に管理者権限がないため、実行することが出来ません..." });
                            }
                        }
                    }
                    if (interaction.isButton()) {
                        const customId = interaction.customId
                        const data = (() => {
                            try {
                                const json = JSON.parse(customId) as ttt
                                if (!json || typeof json !== "object") return
                                if (!("type" in json && "data" in json && typeof json.data === "object")) return
                                if (
                                    json.type === "buttoncreate" &&
                                    !(
                                        "roleId" in json.data &&
                                        "question" in json.data &&
                                        typeof json.data.roleId === "string" &&
                                        typeof json.data.question === "boolean"
                                    )
                                ) return
                                if (
                                    json.type === "calc" &&
                                    !(
                                        "roleId" in json.data &&
                                        "buttonNum" in json.data &&
                                        "calcType" in json.data &&
                                        typeof json.data.roleId === "string" &&
                                        typeof json.data.buttonNum === "number" &&
                                        typeof json.data.calcType === "number"
                                    )
                                ) return
                                if (
                                    json.type === "multirole" &&
                                    !(
                                        "roleId" in json.data &&
                                        typeof json.data.roleId === "string"
                                    )
                                ) return
                                return json
                            }
                            catch (e) { return } //JSONではない文字列の場合undefinedを返す
                        })()
                        let roleGive: { give: boolean, roleId?: string } = {
                            give: false
                        }
                        if (data)
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
                                    handyTool.arrayRandom(ord)
                                    embed.setTitle("問題！")
                                    embed.setDescription("下の計算を解くだけで認証が出来ます！")
                                    embed.addFields({
                                        name: num[0] + ord[answer].type + num[1] + "=",
                                        value: "の答えを下から選びましょう。"
                                    })
                                    const components = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
                                    for (let i = 0; ord.length != i; i++) {
                                        const data = {
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
                                    await interaction.reply({
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
                            } else if (data.type = "multirole") {
                                const { roleId } = data.data
                                if (!interaction.guild) {
                                    return
                                }
                                const role = await interaction.guild.roles.fetch(roleId)
                                const member = interaction.guild.members.cache.get(interaction.user.id)
                                if (!role || !member) {
                                    return
                                }
                                if (member.roles.cache.has(roleId)) {
                                    try {
                                        await member.roles.remove(role)
                                        await interaction.reply({
                                            content: "ロールをはく奪してやりました！",
                                            ephemeral: true
                                        })
                                    } catch (e) {
                                        await interaction.reply({
                                            content: "認証でエラーが発生してしまいました...\nエラーは管理者が確認し修正します。",
                                            ephemeral: true
                                        })
                                    }
                                } else {
                                    try {
                                        await member.roles.add(role)
                                        await interaction.reply({
                                            content: "ロールを付与しました！",
                                            ephemeral: true
                                        })
                                    } catch (e) {
                                        await interaction.reply({
                                            content: "認証でエラーが発生してしまいました...\nエラーは管理者が確認し修正します。",
                                            ephemeral: true
                                        })
                                    }
                                }
                            }
                        if (roleGive.give && roleGive.roleId && interaction.channel) {
                            try {
                                if (interaction.guild) {
                                    const member = interaction.guild.members.cache.get(interaction.user.id)
                                    const role = await interaction.guild.roles.fetch(roleGive.roleId)
                                    if (member && role) {
                                        member.roles.add(role)
                                        await interaction.reply({
                                            content: "ロールを付与しました！",
                                            ephemeral: true
                                        })
                                    }
                                } else {
                                }
                            }
                            catch (e) {
                                await interaction.reply({
                                    content: "認証でエラーが発生してしまいました...\nエラーは管理者が確認し修正します。",
                                    ephemeral: true
                                })
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
    /**
     * トークンを設定し、保存します。
     * @param token トークンを設定します。
     */
    async token(token: string) {
        this.data.json[this.rtdata.name].token = token
        await this.data.save()
    }
    /**
     * リアルタイムJSONにプログラムを配置。クラスを削除してもプログラムが実行できるようにします。(未検証)
     */
    private async programSeting() {
        const progs = this.data.json[this.rtdata.name].programs
        if (progs)
            for (let i = 0; i !== progs.length; i++)
                if (this.rtdata.program && !this.rtdata.program[progs[i]]) this.rtdata.program[progs[i]] = this.programs[progs[i]]
    }
    get programSetting() {
        const data = this
        if (!data.data.json[data.rtdata.name].programs) data.data.json[data.rtdata.name].programs = []
        const progs = data.data.json[data.rtdata.name].programs
        return {
            async add(programName: string) {
                if (programName in data.programs && progs && !progs.includes(programName)) {
                    progs.push(programName)
                    await data.data.save()
                    await data.programSeting()
                    return true
                }
                return false
            },
            async remove(programName: string) {
                if (programName in data.programs && progs && progs.includes(programName)) {
                    progs.splice(progs.indexOf(programName), 1)
                    await data.data.save()
                    if (data.rtdata.program && data.rtdata.program[programName]) delete data.rtdata.program[programName]
                    return true
                }
                return false
            }
        }
    }
    get programsNameList() { return Object.keys(this.programs) }
    async login() {
        if (!this.rtdata.status) return
        if (!this.rtdata.client) return
        if (this.rtdata.status.logined) return
        const token = this.data.json[this.rtdata.name].token
        if (!token) return
        try {
            await this.rtdata.client.login(token)
            this.rtdata.status.logined = true
        } catch (e) { }
    }
    async logout() {
        if (!this.rtdata.status) return
        if (!this.rtdata.client) return
        if (!this.rtdata.status.logined) return
        this.rtdata.client.destroy()
        this.rtdata.status.logined = false
    }
    get botStatus() {
        if (this.rtdata.status) return this.rtdata.status.logined ? true : false
        return false
    }
}
/**
 * 便利なDiscordに関するツールを集めました。
 */
export namespace tool {
    /**
     * Botをメンションしたメッセージかどうかを判別します。
     * @param mentions 
     * @param client 
     * @returns 
     */
    export function mentionIs(mentions: Discord.MessageMentions<boolean>, client?: Discord.Client<boolean>) {
        const mainClient = client ? client : mentions.client
        if (mainClient.user) {
            if (mentions.users.has(mainClient.user.id)) return true
            if (mentions.roles.some(r => { if (mainClient.user) return [mainClient.user.username].includes(r.name) })) return true
        }
        return false
    }
}
export default discordBot
