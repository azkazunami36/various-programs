class settingApp {
    constructor(element: HTMLElement) {
        function ce<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] { return document.createElement(tagName) }
        const mainAria = ce("div")
        const mainSideBar = ce("div")
        const mainSideBarMargin = ce("div")
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
            for (let j = 0; j !== settingItem[i].length; j++) {
                const mainSideBarItem = ce("div")
                const mainSideBarButton = ce("div")
                mainSideBarButton.innerText = settingItem[i][j].name
            }
        }
    }
}
new settingApp(document.body)
