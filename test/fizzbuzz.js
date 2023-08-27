//@ts-check

for (let i = 0; i !== 50; i++) {
    let str = ""
    if (i % 3 === 0) str += "Fizz"
    if (i % 5 === 0) str += (str ? " " : "") + "Buzz"
    console.log(str ? str : i)
}
