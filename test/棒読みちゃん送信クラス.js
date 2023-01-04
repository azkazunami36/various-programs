const net = require("net")
const bclient = new net.Socket()

bclient.on("ready", n => console.log("接続しました。"))
bclient.on("error", e => { if (e) console.log(e) })
bclient.on("end", n => console.log("切断済みです。"))
/**
 * 棒読みちゃん送信に使いやすい関数
 * @param {String} text 送信するテキストを入力
 * @param {Number} speed 速度を入力
 * @param {Number} tone 声の高さを入力
 * @param {Number} volume 間で音量を入力
 * @param {Number} voice 声の種類を入力
 */
const bsend = async (text, speed, tone, volume, voice) => {
    if (bclient.connecting) return console.log("まだ送信が終わっていません。");
    if (!text) text = "テキストがありません。";
    if (!speed) speed = -1;
    if (!tone) tone = -1;
    if (!volume) volume = -1;
    if (!voice) voice = 0;
    console.log("次のテキストを送信します。:" + text);
    bclient.connect("50001", "localhost");
    let Command = new Buffer.allocUnsafe(2);
    Command.writeInt16LE(1, 0);
    bclient.write(Command);
    let Speed = new Buffer.allocUnsafe(2);
    Speed.writeInt16LE(speed, 0);
    bclient.write(Speed);
    let Tone = new Buffer.allocUnsafe(2);
    Tone.writeInt16LE(tone, 0);
    bclient.write(Tone);
    let Volume = new Buffer.allocUnsafe(2);
    Volume.writeInt16LE(volume, 0);
    bclient.write(Volume);
    let Voice = new Buffer.allocUnsafe(2);
    Voice.writeInt16LE(voice, 0);
    bclient.write(Voice);
    let Code = new Buffer.allocUnsafe(1);
    Code.writeInt8(0, 0);
    bclient.write(Code);
    let Message = new Buffer.from(text, "utf8");
    let Length = new Buffer.allocUnsafe(4);
    Length.writeInt32LE(Message.length, 0);
    bclient.write(Length);
    bclient.write(Message);
    bclient.end();
};
class Bouyomi {
    /**
     * 読み上げ設定をします。
     * @param sp 速度
     * @param tn 音程
     * @param vol 音量
     * @param vc 種類
     */
    constructor(sp, tn, vol, vc) {
        //ここらへんは初期化するようなもんです。
        this.speed = (!sp) ? sp : -1
        this.tone = (!tn) ? tn : -1
        this.volume = (!vol) ? vol : -1
        this.voice = (!vc) ? vc : 0
    }
    /**
     * 棒読みちゃんの読み上げ速度を設定します。
     * @param {number} sp
     */
    set speed(sp) {
        console.log("set")
        let speed = sp
        speed = (speed > 200) ? 200 : speed
        speed = (speed < 0) ? 0 : speed
    }
    get speed() {
        console.log("get")
        return this.speed
    }

}
const bclient2 = new Bouyomi(100, 120, 100, 0)
setTimeout(() => {
    bclient2.speed = 110
}, 1000);
