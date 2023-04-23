import Discord, { Events } from "discord.js";
import ffi from 'ffi-napi'
import ref from 'ref-napi'
import StructType from 'ref-struct-napi'

const {
    Client,
    GatewayIntentBits,
    Partials
} = Discord

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.Guilds
    ]
})

client.on(Events.MessageCreate, message => {
    if (message.author.bot) return
    const msgContent = message.content
})

let my_xy = StructType({
    x: ref.types.double,
    y: ref.types.double,
});

let buf = [];

let v0 = new my_xy;
let v1 = new my_xy;
v0.x = 0.1; v0.y = 0.2;
v1.x = 1.1; v1.y = 1.2;

buf.push(v0.ref());
buf.push(v1.ref());

let buf2 = Buffer.concat(buf);

const mylib = ffi.Library('./mylib.so', {
    'my_new': ['pointer', ['pointer', 'uint32']],
});

let handle = mylib.my_new(buf2, 2);