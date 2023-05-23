import readline from "readline"

async function question(text: string): Promise<string> {
    const iface =
        readline.createInterface({ input: process.stdin, output: process.stdout })
    return await
        new Promise(resolve => iface.question(text + "> ", answer => { iface.close(); resolve(answer) }))
}

(async () => {
    return
    const data: string[] = []
    for (let end = false; !end;) {
        const string = await question("入力してください。");
        if (string === "ちんぽこー") end = true
        else {
            let type = false
            for (const str of data) if (str === string) type = true;
            if (string === "") type = true
            if (!type) data.push(string)
        }
    }
    console.log(JSON.stringify(data))
})()

const temp = [
    /**
     * 品詞の種類
     */
    ["名詞", "係助詞", "副詞", "形容詞", "接続助詞", "動詞", "形容動詞", "連体詞", "接続詞", "助動詞", "助詞"]
];

(async () => {
    const data: {
        type: string,
        string: string
    }[] = []
    while (true) {
        const program: (() => Promise<void>)[] = [
            async () => {
                const das: {
                    [name: string]: string[]
                } = {}
                for (let i = 0; i !== data.length; i++) {
                    if (!das[data[i].type]) das[data[i].type] = []
                    das[data[i].type].push(data[i].string)
                }
                console.log(das)
            },
            async () => {
                const string = await question("入力してください。");
                console.log(temp[0])
                const select = Number(await question("タイプを選択してください。"))
                let type = false
                for (const str of data) if (str.string === string) type = true;
                if (string === "") type = true
                if (!type && !Number.isNaN(select)) data.push({
                    type: temp[0][select - 1],
                    string: string
                })
            },
            async () => {console.log(data)}
        ]
        const input = Number(await question("１は文書パース。２は登録です。３はJSONを出力します。"))
        if (!Number.isNaN(input)) await program[input - 1]()
    }
})()
