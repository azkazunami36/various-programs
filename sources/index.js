addEventListener("load", async () => {
    (await fetch("stylesheet.css")).text().then(data => document.getElementsByTagName("style")[0].innerHTML = data);
});