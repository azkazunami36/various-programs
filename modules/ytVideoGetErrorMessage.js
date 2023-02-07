/**
 * ytdlのエラーを短く日本語で説明するためのものです。
 * ですが、あまり意味を深く調べず、適当に入力しているため正しくない可能性があります。
 * @param {string} message 
 * @returns 日本語の説明を返すか、nullを返します
 */
module.exports.ytVideoGetErrorMessage = message => {
    if (message === "Join this channel to get access to members-only content like this video, and other exclusive perks.")
        return "チャンネルのメンバーでないため、データを取得できません。"
    if (message === "Video unavailable")
        return "このVideoIDは無効なため、データを取得できません。"
    if (message === "This is a private video. Please sign in to verify that you may see it.")
        return "このVideoIDは投稿者が非公開にしているため、データを取得できません。"
    if (message === "socket hang up")
        return "通信エラーによりサーバーが送信を切断しました。"
    if (message === "aborted")
        return "大きな負荷や遅延等により、通信が切断されました。"
    if (message === "No such format found: highest")
        return "要求した品質が存在しないようです。\nこのエラーが複数発生していた場合、VideoIDとともにお知らせください。"
    if (message === "This video has been removed for violating YouTube's policy on nudity or sexual content")
        return "ボリシーに違反したため、この動画は削除されています。理由: ヌードや性的コンテンツ"
    if (message.match(/getaddrinfo ENOTFOUND/))
        return "通信エラーにより通信が切断されました。"
    if (message.match(/read ECONNRESET/))
        return "エラーにより通信がリセットされました。"
    if (message.match(/connect ETIMEDOUT/))
        return "通信がタイムアウトしました。"
    if (message.match(/connect ECONNREFUSED/))
        return "通信が拒否されました。"
    if (message.match(/connect ENETUNREACH/))
        return "通信がタイムアウトしました。"
    if (message == "write EPIPE")
        return "保存処理中にエラーが発生し、通信を切断しました。"
    if (message.match(/Request failed with status code 404/))
        return "データが存在せず、取得できませんでした。"
    return null
}
