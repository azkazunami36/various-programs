import { getRuleBySelector } from "./handyTool.js"

export class settingApp {
    constructor(element: HTMLElement) {
        function ce<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] { return document.createElement(tagName) }
        const mainAria = ce("div")
        mainAria.id = "settingApp-mainAria"
        const mainSideBar = ce("div")
        mainSideBar.id = "settingApp-mainSideBar"
        mainAria.appendChild(mainSideBar)
        const mainSideBarMargin = ce("div")
        mainSideBarMargin.className = "settingApp-mainSideBarMargin"
        mainSideBar.appendChild(mainSideBarMargin)
        type settingDesign = ({
            type: "text"
            fontSize?: number
            text: string
        } | {
            type: "itemGroup"
            name?: string
            body: {
                name: string
                id: string
            }[]
        })[]
        const settingItem: {
            name: string
            id: string
            svgIcon?: string
            settingDesign: settingDesign
        }[][] = [
                [
                    {
                        name: "マウス",
                        id: "mouseSetting",
                        svgIcon: "generalIcon/mouseCursor.svg",
                        settingDesign: [
                            {
                                type: "text",
                                text: "マウス設定",
                                fontSize: 30
                            }
                        ]
                    }
                ],
                [
                    {
                        name: "File Manager",
                        id: "fileManager",
                        settingDesign: []
                    },
                    {
                        name: "Window System",
                        id: "windowSystem",
                        settingDesign: []
                    }
                ],
                [
                    {
                        name: "その他",
                        id: "others",
                        svgIcon: "generalIcon/etc....svg",
                        settingDesign: []
                    },
                    {
                        name: "Various Programsについて",
                        id: "info",
                        svgIcon: "generalIcon/info-white.svg",
                        settingDesign: [
                            {
                                type: "text",
                                text: "これはVarious Programs、かずなみ制作のなんでも出来るプログラムのブラウザ版です。詳しくはGitHubをご覧ください。"
                            }
                        ]
                    }
                ]
            ]
        for (let i = 0; i !== settingItem.length; i++) {
            const mainSideBarGroup = ce("div")
            mainSideBarGroup.className = "settingApp-mainSideBarGroup"
            for (let j = 0; j !== settingItem[i].length; j++) {
                const mainSideBarItem = ce("div")
                const mainSideBarButton = ce("div")
                const mainSideBarIcon = ce("img")
                const mainSideBarButtonActiveColor = ce("div")
                mainSideBarButtonActiveColor.style.background = "rgb(50, 50, 255)"
                mainSideBarButtonActiveColor.style.width = "100%"
                mainSideBarButtonActiveColor.style.height = "100%"
                mainSideBarIcon.className = "settingApp-mainSideBarIcon"
                mainSideBarButton.appendChild(mainSideBarIcon)
                if (settingItem[i][j].svgIcon) mainSideBarIcon.src = "svgIcon/" + settingItem[i][j].svgIcon
                const mainSideBarName = ce("div")
                mainSideBarName.className = "settingApp-mainSideBarName"
                mainSideBarButton.appendChild(mainSideBarName)
                const title = ce("p")
                title.style.minWidth = "200px"
                mainSideBarName.appendChild(title)
                title.innerText = settingItem[i][j].name
                mainSideBarButton.className = "settingApp-mainSideBarButton"
                mainSideBarItem.appendChild(mainSideBarButton)
                mainSideBarItem.className = "settingApp-mainSideBarItem"
                mainSideBarGroup.appendChild(mainSideBarItem)
            }
            mainSideBar.appendChild(mainSideBarGroup)
        }
        const mainWindow = ce("div")
        mainWindow.id = "settingApp-mainWindow"
        function itemSelect(settingDesign: settingDesign) {
            itemConst(settingDesign)
        }
        function itemConst(settingDesign: settingDesign) {
            mainWindow.innerText = ""
            for (let i = 0; i !== settingDesign.length; i++) {
                const design = settingDesign[i]
                if (design.type === "text") {
                    const text = ce("div")
                    text.innerText = design.text
                    text.style.color = "white"
                    text.style.margin = "10px"
                    if (design.fontSize) text.style.fontSize = design.fontSize + "px"
                    mainWindow.appendChild(text)
                }
            }
        }
        if (settingItem[0][0].id) itemSelect(settingItem[0][0].settingDesign)
        mainAria.appendChild(mainWindow)
        let sideBarStatus = false
        function sideBarOpen() {
            if (mainAria.clientWidth < 750 && sideBarStatus === true) {
                sideBarStatus = false
                const mainSideBar = getRuleBySelector("#settingApp-mainSideBar")
                const mainSideBarName = getRuleBySelector(".settingApp-mainSideBarName")
                const mainWindow = getRuleBySelector("#settingApp-mainWindow")
                if (mainSideBar && mainSideBarName && mainWindow) {
                    mainSideBar.width = "65px"
                    mainSideBarName.width = "0px"
                    mainWindow.width = "calc(100% - 65px)"
                }
            } else if (mainAria.clientWidth > 750 && sideBarStatus === false) {
                sideBarStatus = true
                const mainSideBar = getRuleBySelector("#settingApp-mainSideBar")
                const mainSideBarName = getRuleBySelector(".settingApp-mainSideBarName")
                const mainWindow = getRuleBySelector("#settingApp-mainWindow")
                if (mainSideBar && mainSideBarName && mainWindow) {
                    mainSideBar.width = "270px"
                    mainSideBarName.width = "200px"
                    mainWindow.width = "calc(100% - 270px)"
                }
            }
        }
        const resizeObserver = new ResizeObserver(sideBarOpen)
        resizeObserver.observe(mainAria)
        element.appendChild(mainAria)
    }
}
