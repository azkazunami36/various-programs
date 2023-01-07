import express from "express";
import * as readline from "readline";
import * as fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import * as http from "http";
import request from "request";
import cors from "cors";
import * as ytdl from "ytdl-core";
import ytch from "yt-channel-info";
import yts from "yt-search";
import * as querystring from "querystring";
import axios from "axios";
import * as path from "path";
import * as util from "util";
import sharp from "sharp";
import * as discordjs from "discord.js";
import * as discordjsVoice from "@discordjs/voice";
import imageSize from "image-size";

const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    Events,
    Message
} = discordjs;
const {
    entersState,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    StreamType,
    AudioPlayerStatus
} = discordjsVoice;
const wait = (time: number) => new Promise<void>(resolve => setTimeout(n => resolve(), time));
import dtbs from "./data/data.json"
(async () => {
})();
