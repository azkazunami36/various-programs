addEventListener("load", async () => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/applcation-info");
    xhr.send();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) { //通信が完了し、成功をマークしていたら
            console.log(xhr.responseText);
            let app = JSON.parse(xhr.responseText);
            for (let i = 0; i != app.length; i++) {
                const applist = document.getElementById("App-List");
                const elem = document.createElement("div");
                elem.classList.add("Apps");
                const AppName = document.createElement("div");
                AppName.innerHTML = app[i].name;
                AppName.classList.add("appName")
                const clickme = document.createElement("a");
                clickme.id = app[i].id + "button";
                clickme.href = "sources/" + app[i].compact + "/";
                clickme.classList.add("clickme");
                const body = document.createElement("div")
                const script = document.createElement("script")
                new Promise(resolve => {
                    const xhr = new XMLHttpRequest()
                    xhr.open("get", "http://" + location.hostname + ":" + location.port + "/sources/" + app[i].compact + "/info.html")
                    xhr.send()
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            body.innerHTML = xhr.responseText
                            resolve()
                        }
                    }
                })
                new Promise(resolve => {
                    const xhr = new XMLHttpRequest()
                    xhr.open("get", "http://" + location.hostname + ":" + location.port + "/sources/" + app[i].compact + "/info.js")
                    xhr.send()
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            script.innerHTML = xhr.responseText
                            resolve()
                        }
                    }
                })
                body.classList.add("info")
                elem.appendChild(AppName);
                elem.appendChild(body)
                elem.appendChild(script)
                elem.appendChild(clickme);
                applist.appendChild(elem);
            };
        };
    };
});