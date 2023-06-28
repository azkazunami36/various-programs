import express from "express"
import request from "request"

import fileLister from "./fileLister"

export const fileWirelessSend = class {
    constructor() {

    }
    ipAddress: string = ""
    #port: number = 1
    set port(num: number) {
        if (num > 25565) { this.#port = 25565 }
        else if (num < 0) { this.#port = 0 }
        else { this.#port = num }
    }
}
