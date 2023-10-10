class settingApp {
    constructor(element: HTMLElement) {
        function ce<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] { return document.createElement(tagName) }
        const mainAria = ce("div")
        mainAria.id = "mainAria"
        const mainSideBar = ce("div")
        mainSideBar.id = "mainSideBar"
        mainAria.appendChild(mainSideBar)
        const mainSideBarMargin = ce("div")
        mainSideBarMargin.className = "mainSideBarMargin"
        mainSideBar.appendChild(mainSideBarMargin)
        const settingItem = [
            [
                {
                    name: "マウス",
                    id: "mouseSetting"
                }
            ],
            [
                {
                    name: "その他",
                    id: "others"
                }
            ]
        ]
        for (let i = 0; i !== settingItem.length; i++) {
            const mainSideBarGroup = ce("div")
            mainSideBarGroup.className = "mainSideBarGroup"
            for (let j = 0; j !== settingItem[i].length; j++) {
                const mainSideBarItem = ce("div")
                const mainSideBarButton = ce("div")
                mainSideBarButton.innerText = settingItem[i][j].name
                mainSideBarButton.className = "mainSideBarButton"
                mainSideBarItem.appendChild(mainSideBarButton)
                mainSideBarItem.className = "mainSideBarItem"
                mainSideBarGroup.appendChild(mainSideBarItem)
            }
            mainSideBar.appendChild(mainSideBarGroup)
        }
        const mainWindow = ce("div")
        mainWindow.id = "mainWindow"
        mainAria.appendChild(mainWindow)
        element.appendChild(mainAria)
    }
}
addEventListener("load", () => {
    new settingApp(document.body)
})
