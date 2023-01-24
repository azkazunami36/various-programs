addEventListener("load", () => {
    const output = document.getElementById("out")
    const text = document.getElementById("inputText")
    const base64 = document.getElementById("inputBase64")
    text.addEventListener("input", () => {
        output.innerHTML = btoa(text.value)
    })
    base64.addEventListener("input", () => {
        output.innerHTML = atob(base64.value)
    })
})
