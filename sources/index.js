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
                const clickme = document.createElement("a");
                clickme.id = app[i].id + "button";
                clickme.href = "sources/" + app[i].compact + "/";
                clickme.classList.add("clickme");
                elem.appendChild(AppName);
                elem.appendChild(clickme);
                applist.appendChild(elem);
            };
        };
    };
});