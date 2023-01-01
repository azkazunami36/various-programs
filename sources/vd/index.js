/**
 * テスト用として、ユーザーデータ等の情報をここに格納します。  
 * 今後get等で情報が更新できるようにします。
 */
const data = {
    "Apps": {
        "yt": {
            "name": "YouTube Downloader",
            "shortName": "YTDL",
            "id": "yt"
        },
        "btb": {
            "name": "Bottom Bar",
            "shortName": "BtBar",
            "id": "bb"
        },
        "bg": {
            "name": "Background",
            "shortName": "BGround",
            "id": "bg"
        }
    },
    "usingApp": [
        "yt"
    ]
}
/**
 * CSSのガイドです。
 */
const css = {
    position: {
        absolute: "absolute",
        relative: "relative",
        fixed: "fixed",
        static: "static",
        sticky: "sticky",
        inherit: "inherit",
        initial: "initial",
        unset: "unset"
    },
    color: {
        mycolor: {
            skeletonWhite: "rgba(255, 255, 255, 0.1)",
            skeletonBlack: "rgba(0, 0, 0, 0.1)"
        },
        black: "black",
        white: "white",
        aqua: "aqua",
        blue: "blue",
        brown: "brown",
        cyan: "cyan",
        gold: "gold",
        gray: "gray",
        green: "green",
        lime: "lime",
        magenta: "magenta",
        orange: "orange",
        pink: "pink",
        purple: "purple",
        red: "red",
        snow: "snow",
        yellow: "yellow"
    }
}
/**
 * 待機するやつ
 * @param {number} time 
 * @returns 
 */
const wait = async time => await new Promise(resolve => setTimeout(() => { resolve() }, time))
/**
 * 
 * @param {} e 
 */
const bbStarter = async e => {
    const bottombar = document.createElement("div")
    document.body.appendChild(bottombar)

    const id = data.Apps.btb.id
    bottombar.id = id + "line"

    bottombar.style.width = document.body.clientWidth + "px"
    bottombar.style.height = "45px"
    bottombar.style.position = css.position.absolute
    bottombar.style.background = css.color.black
    bottombar.style.color = css.color.white
    bottombar.style.top = document.body.clientHeight - bottombar.clientHeight
    bottombar.style.zIndex = "10"

    addEventListener("resize", async e => {
        const interval = setInterval(() => {
            bottombar.style.width = document.body.clientWidth + "px"
            bottombar.style.top = document.body.clientHeight - bottombar.clientHeight
        }, 50)
        setTimeout(() => {
            clearInterval(interval)
        }, 200)
    })

    const appline = document.createElement("div")
    bottombar.appendChild(appline)

    appline.style.width = document.body.clientWidth / 1.5 + "px"
    appline.style.height = "45px"
    appline.style.position = css.position.relative

    for (let i = 0; i != data.usingApp.length; i++) {
        const appicon = document.createElement("div")
        appline.appendChild(appicon)

        appicon.id = id + "app-" + i

        appicon.style.width = "60px"
        appicon.style.height = "45px"
        appicon.style.position = css.position.absolute
        appicon.style.background = ""
        appicon.style.left = 5 + (60 * i) + (5 * i) + "px"

        appicon.addEventListener("mouseover", e => {
            appicon.style.background =
                "linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.15))"
        })
        appicon.addEventListener("mouseleave", e => {
            appicon.style.background = ""
        })
        appicon.addEventListener("mousedown", e => {
            appicon.style.background =
                "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.125))"
        })
        appicon.addEventListener("mouseup", e => {
            appicon.style.background =
                "linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.15))"
        })

        const appinner = document.createElement("div")
        appicon.appendChild(appinner)

        appinner.style.width = "60px"
        appinner.style.height = "45px"
        appinner.style.position = css.position.relative

        const appname = document.createElement("p")
        appicon.appendChild(appname)

        appname.innerHTML = data.Apps[data.usingApp[i]].shortName

        appname.style.margin = "0"
        appname.style.fontSize = "6px"
        appname.style.position = css.position.absolute
        appname.style.top = (appinner.clientHeight / 2) - (appname.clientHeight / 2)
        appname.style.left = (appinner.clientWidth / 2) - (appname.clientWidth / 2)
    }
}
const bgStarter = e => {
    const background = document.createElement("div")
    document.body.appendChild(background)

    const id = data.Apps.bg.id
    background.id = id + "back"

    background.style.width = document.body.clientWidth + "px"
    background.style.height = document.body.clientHeight + "px"
    background.style.position = css.position.absolute
    background.style.background = css.color.cyan
    background.style.zIndex = "-1"

    addEventListener("resize", async e => {
        const interval = setInterval(() => {
            background.style.width = document.body.clientWidth + "px"
            background.style.height = document.body.clientHeight + "px"
        }, 50)
        setTimeout(() => {
            clearInterval(interval)
        }, 200)
    })
}
window.onload = e => {
    //初期化
    document.body.style.margin = "0"
    document.body.style.userSelect = "none"

    //ここからはWindowsで言うスタートアップなんてものを妄想したものです
    bbStarter()
    bgStarter()
}
