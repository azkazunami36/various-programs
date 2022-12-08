const xhr = new XMLHttpRequest();
let app
xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/applcation-info");
xhr.send();
xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) { //通信が完了し、成功をマークしていたら
        console.log(xhr.responseText);
        app = JSON.parse(xhr.responseText);
    };
};
addEventListener("load", async () => {
    (await fetch("stylesheet.css"))
        .text().then(data => document.getElementsByTagName("style")[0].innerHTML = data);

    for (let i = 0; i != app.length; i++) {
        const applist = document.getElementById("App-List");
        const elem = document.createElement("div");
        elem.classList.add("Apps");
        const AppName = document.createElement("div");
        AppName.innerHTML = app[i].name;
        const clickme = document.createElement("div");
        clickme.id = app[i].id + "button";
        clickme.classList.add("clickme");
        elem.appendChild(AppName);
        elem.appendChild(clickme);
        applist.appendChild(elem);

        const inhtml = document.createElement("div");
        inhtml.classList.add("Fullsize-Popup");
        const header = document.createElement("div");
        header.classList.add("Popup-header");
        const WindowName = document.createElement("div");
        WindowName.classList.add("Popup-name");
        WindowName.innerHTML = app[i].name;
        const closeButton = document.createElement("div");
        closeButton.classList.add("Popup-close");
        const clickme2 = document.createElement("div");
        clickme2.classList.add("clickme");
        const closeicon = document.createElement("div");
        closeButton.innerHTML = "×";
        const inscript = document.createElement("div");
        const instyle = document.createElement("div");
        const inbody = document.createElement("div");
        inbody.id = app[i].compact + "inbody";
        inbody.classList.add("Popup-body");
        document.body.appendChild(inhtml);
        inhtml.appendChild(header);
        inhtml.appendChild(inscript);
        inhtml.appendChild(instyle);
        inhtml.appendChild(inbody);
        header.appendChild(WindowName);
        header.appendChild(closeButton);
        closeButton.appendChild(closeicon);
        closeButton.appendChild(clickme2);

        clickme.addEventListener("click", async e => {
            if (!app[i].status.viewed) {
                inhtml.classList.add("Popup-Viewed");
                app[i].status.viewed = true;
            };
            if (!app[i].status.loaded) {
                (await fetch(app[i].compact + "index.html"))
                    .text().then(data => inbody.innerHTML = data);
                const el = document.createElement("script");
                el.src = app[i].compact + "index.js";
                inscript.appendChild(el);
                const ele = document.createElement("style");
                (await fetch(app[i].compact + "stylesheet.css"))
                    .text().then(data => ele.innerHTML = data);
                    instyle.appendChild(ele);
                    app[i].status.loaded = true;
            }
        });
        clickme2.addEventListener("click", async e => {
            if (app[i].status.viewed) {
                inhtml.classList.remove("Popup-Viewed");
                app[i].status.viewed = false;
            };
        });
    };
});