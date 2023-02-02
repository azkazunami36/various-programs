addEventListener("load", () => {
    const output = document.getElementById("out")
    const text = document.getElementById("inputText")
    const base64 = document.getElementById("inputBase64")
    text.addEventListener("input", () => {
        let raw = atob(text.value);
        let HEX = ''
        for (i = 0; i < raw.length; i++) {
            let _hex = raw.charCodeAt(i).toString(16)
            HEX += (_hex.length == 2 ? _hex : '0' + _hex)
        }
        output.innerHTML = HEX.toUpperCase().toString(10)
    })
    base64.addEventListener("input", () => {
        output.innerHTML = atob(base64.value)
    })
})
