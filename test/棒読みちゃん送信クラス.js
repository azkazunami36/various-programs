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

const Bouyomi = (() => {
    const indata = {
        /** 速度 */ speed: 0,
        /** 音程 */ tone: 0,
        /** 音量 */ volume: 0,
        /** 種類 */ voice: 0,
        /** ポート */ port: 0,
        /** アドレス */ address: "",
        /** 文字コード */ ccode: ""
    }
    return class Bouyomi {
        /**
         * 読み上げ設定をします。
         * @param {indata} data 入力します
         */
        constructor(data) {
            //ここらへんは初期化するようなもんです。
            this.speed = data.speed ? data.speed : -1
            this.tone = data.tone ? data.tone : -1
            this.volume = data.volume ? data.volume : -1
            this.voice = data.voice ? data.voide : 0
            this.port = data.port ? data.port : 50080
            this.address = data.address ? data.address : "localhost"
            this.ccode = data.ccode ? data.ccode : "utf-8"
            this.client = new net.Socket()
            this.client.on("ready", n => console.log("接続しました。"))
            this.client.on("error", e => console.log(e))
            this.client.on("end", n => console.log("切断済みです。"))
        }
        set speed(d) {
            d = (d > 200) ? 200 : d
            d = (d < -1) ? -1 : d
            this.sp = d
        }
        get speed() {
            return this.sp
        }
        set tone(d) {
            d = (d > 200) ? 200 : d
            d = (d < -1) ? -1 : d
            this.tn = d
        }
        get tone() {
            return this.tn
        }
        set volume(d) {
            d = (d > 100) ? 100 : d
            d = (d < -1) ? -1 : d
            this.vol = d
        }
        get volume() {
            return this.vol
        }
        set voice(d) {
            d = (d < 0) ? 0 : d
            this.vc = d
        }
        get voice() {
            return this.vc
        }
        set port(d) {
            d = (d > 65535) ? 65535 : d
            d = (d < 0) ? 0 : d
            this.pt = d
        }
        get port() {
            return this.pt
        }
        set address(d) {
            this.url = d
        }
        get address() {
            return this.url
        }
        set ccode(d) {
            this.code = d
        }
        get ccode() {
            return this.code
        }
        send(msg) {
            console.log("次のテキストを送信します。:" + msg);
            this.client.connect(this.pt, this.url)
            let Command = new Buffer.alloc(2)
            Command.writeInt16LE(1, 0)
            this.client.write(Command)
            let Speed = new Buffer.alloc(2)
            Speed.writeInt16LE(this.sp, 0)
            this.client.write(Speed)
            let Tone = new Buffer.alloc(2)
            Tone.writeInt16LE(this.tn, 0)
            this.client.write(Tone)
            let Volume = new Buffer.alloc(2)
            Volume.writeInt16LE(this.vol, 0)
            this.client.write(Volume)
            let Voice = new Buffer.alloc(2)
            Voice.writeInt16LE(this.vc, 0)
            this.client.write(Voice)
            let Code = new Buffer.alloc(1)
            Code.writeInt8(0, 0)
            this.client.write(Code)
            let Message = new Buffer.from(msg, "utf8")
            let Length = new Buffer.alloc(4)
            Length.writeInt32LE(Message.length, 0)
            this.client.write(Length)
            this.client.write(Message)
            this.client.end()
        }
    }
})()
const bclient2 = new Bouyomi()
setTimeout(() => {
    console.log(bclient2.speed)
    bclient2.speed = 110
    console.log(bclient2.speed)
    bclient2.port = 2000
    setTimeout(() => {
        bclient2.send("てすと")
    }, 100);
}, 1000);
