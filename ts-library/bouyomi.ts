import net from "net"
import EventEmitter from "events"

interface bouyomiStatus {
    speed?: number
    tone?: number
    volume?: number
    voice?: number
    address?: string
    port?: number
}
interface BouyomiEvents {
    ready: [void],
    error: [Error],
    end: [void]
}
export declare interface Bouyomi {
    on<K extends keyof BouyomiEvents>(s: K, listener: (...args: BouyomiEvents[K]) => any): this
    emit<K extends keyof BouyomiEvents>(eventName: K, ...args: BouyomiEvents[K]): boolean
}
export class Bouyomi extends EventEmitter {
    #client: net.Socket
    #data: { speed: number, tone: number, volume: number, voice: number, port: number, url: string, code: BufferEncoding } = {
        speed: -1,
        tone: -1,
        volume: -1,
        voice: 0,
        port: 50001,
        url: "localhost",
        code: "utf8"
    }
    constructor(data: { speed?: number, tone?: number, volume?: number, voice?: number, port?: number, address?: string, ccode?: BufferEncoding }) {
        super()
        this.speed = data.speed ? data.speed : -1
        this.tone = data.tone ? data.tone : -1
        this.volume = data.volume ? data.volume : -1
        this.voice = data.voice ? data.voice : 0
        this.port = data.port ? data.port : 50001
        this.address = data.address ? data.address : "localhost"
        this.ccode = data.ccode ? data.ccode : "utf8"
        this.#client = new net.Socket()
        const client = this.#client
        client.on("ready", () => this.emit("ready", undefined))
        client.on("error", e => this.emit("error", e))
        client.on("end", () => this.emit("end", undefined))
    }
    set speed(d) {
        d = (d > 200) ? 200 : d
        d = (d < -1) ? -1 : d
        this.#data.speed = d
    }
    get speed() { return this.#data.speed }
    set tone(d) {
        d = (d > 200) ? 200 : d
        d = (d < -1) ? -1 : d
        this.#data.tone = d
    }
    get tone() { return this.#data.tone }
    set volume(d) {
        d = (d > 100) ? 100 : d
        d = (d < -1) ? -1 : d
        this.#data.volume = d
    }
    get volume() { return this.#data.volume }
    set voice(d) {
        d = (d < 0) ? 0 : d
        this.#data.voice = d
    }
    get voice() { return this.#data.voice }
    set port(d) {
        d = (d > 65535) ? 65535 : d
        d = (d < 0) ? 0 : d
        this.#data.port = d
    }
    get port() { return this.#data.port }
    set address(d) { this.#data.url = d }
    get address() { return this.#data.url }
    set ccode(d) { this.#data.code = d }
    get ccode() { return this.#data.code }
    send(msg: string) {
        const client = this.#client
        client.connect(this.#data.port, this.#data.url)
        const Command = Buffer.alloc(2)
        Command.writeInt16LE(1, 0)
        client.write(Command)
        const Speed = Buffer.alloc(2)
        Speed.writeInt16LE(this.#data.speed, 0)
        client.write(Speed)
        const Tone = Buffer.alloc(2)
        Tone.writeInt16LE(this.#data.tone, 0)
        client.write(Tone)
        const Volume = Buffer.alloc(2)
        Volume.writeInt16LE(this.#data.volume, 0)
        client.write(Volume)
        const Voice = Buffer.alloc(2)
        Voice.writeInt16LE(this.#data.voice, 0)
        client.write(Voice)
        const Code = Buffer.alloc(1)
        Code.writeInt8(0, 0)
        client.write(Code)
        const Message = Buffer.from(msg, this.#data.code)
        const Length = Buffer.alloc(4)
        Length.writeInt32LE(Message.length, 0)
        client.write(Length)
        client.write(Message)
        client.end()
    }
}
export default Bouyomi