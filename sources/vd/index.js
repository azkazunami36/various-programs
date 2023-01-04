const wait = time => new Promise(resolve => setTimeout(n => resolve(), time))
const random = num => Math.floor(Math.random() * num)
addEventListener("load", async e => {
    console.log(random(100))
})
