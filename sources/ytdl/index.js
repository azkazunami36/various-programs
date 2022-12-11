const ytURLSend = document.getElementById("ytURLSend");
ytURLSend.addEventListener("click", e => {
    const ytURLBox = document.getElementById("ytURLBox");
    const ytBlackBackground = document.getElementById("ytBlackBackground");
    ytBlackBackground.classList.add("yBlacked");
    const url = ytURLBox.value;
    console.log(url);
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/youtube-info");
    xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8");
    xhr.send(url);
    xhr.onreadystatechange = () => {
        console.log(xhr.readyState + "/" + xhr.status)
        if (xhr.readyState === 4 && xhr.status === 200) { //通信が完了し、成功をマークしていたら
            const data = JSON.parse(xhr.responseText);
            console.log(data);
            const ytTitle = document.getElementById("ytTitle");
            const ytDescription = document.getElementById("ytDescription");
            ytTitle.innerHTML = data.title;
            console.log(data.description);
            const regexp = new RegExp("\n", "g");
            const description = data.description.replace(regexp, "<br>");
            ytDescription.innerHTML = description;
        };
    };
});