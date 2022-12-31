const xhr = new XMLHttpRequest()
xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/ytdlRawInfoArray")
xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8")
xhr.send();
xhr.onreadystatechange = async () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
        const videoIds = JSON.parse(xhr.responseText)
        const count = document.getElementById("count")
        count.innerHTML = videoIds.length
    }
}