addEventListener("load", () => {
    const ytURLSend = document.getElementById("URLSend");
    ytURLSend.addEventListener("click", e => {
        const ytURLBox = document.getElementById("URLBox");
        const ytBlackBackground = document.getElementById("BlackBackground");
        const infoPopup = document.getElementById("infoPopup");
        ytBlackBackground.classList.add("Blacked");
        infoPopup.classList.add("infoPopuped");
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
                const title = data.title;
                const description = data.description.replace(/\n/g, "<br>");
                console.log(description)
            };
        };
    });
});