const xhr = new XMLHttpRequest()
xhr.open("POST", "http://" + location.hostname + ":" + location.port + "/ytvideo-list")
xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8")
xhr.send();
xhr.onreadystatechange = async () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
        const count = document.getElementById("count")
        count.innerHTML = JSON.parse(xhr.responseText).length
    }
}