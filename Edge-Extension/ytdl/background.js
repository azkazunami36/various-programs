chrome.runtime.onInstalled.addListener(function(){
    chrome.contextMenus.create({
        id: "root",
        title: "拡張メニュー",
        contexts: ["all"],
        type: "normal",
    })

    chrome.contextMenus.create({
        parentId: "root",
        id: "wikipedia",
        title: "Wikipediaで開く",
        contexts: ["all"],
        type: "normal",
    })

    chrome.contextMenus.create({
        parentId: "root",
        id: "twitter",
        title: "Twitterで検索する",
        contexts: ["all"],
        type: "normal",
    })
})


//メニューがクリックされた時のコード
chrome.contextMenus.onClicked.addListener(function(event) {
    if(event.menuItemId === "wikipedia"){
        const url = "https://ja.wikipedia.org/wiki/" + event.selectionText
        chrome.tabs.create({url})
    }
    else if(event.menuItemId === "twitter"){
        const url = "https://twitter.com/search?f=realtime&src=typd&q=" + event.selectionText + "%20lang%3Aja"
        chrome.tabs.create({url})
    }
})
