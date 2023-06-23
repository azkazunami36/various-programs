/**
 * qwerty配列の日本語キーボードでかな入力時、入力されたローマ字を推測します。
 * @param string 
 * @param convertTo 
 * @returns 
 */
export function kanaConvert(string: string, convertTo: boolean) {
    const array = [
        {
            "key": " ",
            "kana": " "
        },
        {
            "key": " ",
            "kana": "　"
        },
        {
            "key": "1",
            "kana": "ぬ"
        },
        {
            "key": "2",
            "kana": "ふ"
        },
        {
            "key": "3",
            "kana": "あ"
        },
        {
            "key": "4",
            "kana": "う"
        },
        {
            "key": "5",
            "kana": "え"
        },
        {
            "key": "6",
            "kana": "お"
        },
        {
            "key": "7",
            "kana": "や"
        },
        {
            "key": "8",
            "kana": "ゆ"
        },
        {
            "key": "9",
            "kana": "よ"
        },
        {
            "key": "0",
            "kana": "わ"
        },
        {
            "key": "-",
            "kana": "ほ"
        },
        {
            "key": "^",
            "kana": "へ"
        },
        {
            "key": "¥",
            "kana": "ー"
        },
        {
            "key": "q",
            "kana": "た"
        },
        {
            "key": "w",
            "kana": "て"
        },
        {
            "key": "e",
            "kana": "い"
        },
        {
            "key": "r",
            "kana": "す"
        },
        {
            "key": "t",
            "kana": "か"
        },
        {
            "key": "y",
            "kana": "ん"
        },
        {
            "key": "u",
            "kana": "な"
        },
        {
            "key": "i",
            "kana": "に"
        },
        {
            "key": "o",
            "kana": "ら"
        },
        {
            "key": "p",
            "kana": "せ"
        },
        {
            "key": "@",
            "kana": "゛"
        },
        {
            "key": "[",
            "kana": "゜"
        },
        {
            "key": "a",
            "kana": "ち"
        },
        {
            "key": "s",
            "kana": "と"
        },
        {
            "key": "d",
            "kana": "し"
        },
        {
            "key": "f",
            "kana": "は"
        },
        {
            "key": "g",
            "kana": "き"
        },
        {
            "key": "h",
            "kana": "く"
        },
        {
            "key": "j",
            "kana": "ま"
        },
        {
            "key": "k",
            "kana": "の"
        },
        {
            "key": "l",
            "kana": "り"
        },
        {
            "key": ";",
            "kana": "れ"
        },
        {
            "key": ":",
            "kana": "け"
        },
        {
            "key": "]",
            "kana": "む"
        },
        {
            "key": "z",
            "kana": "つ"
        },
        {
            "key": "x",
            "kana": "さ"
        },
        {
            "key": "c",
            "kana": "そ"
        },
        {
            "key": "v",
            "kana": "ひ"
        },
        {
            "key": "b",
            "kana": "こ"
        },
        {
            "key": "n",
            "kana": "み"
        },
        {
            "key": "m",
            "kana": "も"
        },
        {
            "key": ",",
            "kana": "ね"
        },
        {
            "key": ".",
            "kana": "る"
        },
        {
            "key": "/",
            "kana": "め"
        },
        {
            "key": "_",
            "kana": "ろ"
        },
        {
            "key": "!",
            "kana": "ぬ"
        },
        {
            "key": "\"",
            "kana": "ふ"
        },
        {
            "key": "#",
            "kana": "ぁ"
        },
        {
            "key": "$",
            "kana": "ぅ"
        },
        {
            "key": "%",
            "kana": "ぇ"
        },
        {
            "key": "&",
            "kana": "ぉ"
        },
        {
            "key": "'",
            "kana": "ゃ"
        },
        {
            "key": "(",
            "kana": "ゅ"
        },
        {
            "key": ")",
            "kana": "ょ"
        },
        {
            "key": "0",
            "kana": "を"
        },
        {
            "key": "=",
            "kana": "ほ"
        },
        {
            "key": "~",
            "kana": "へ"
        },
        {
            "key": "|",
            "kana": "ー"
        },
        {
            "key": "Q",
            "kana": "た"
        },
        {
            "key": "W",
            "kana": "て"
        },
        {
            "key": "E",
            "kana": "ぃ"
        },
        {
            "key": "R",
            "kana": "す"
        },
        {
            "key": "T",
            "kana": "か"
        },
        {
            "key": "Y",
            "kana": "ん"
        },
        {
            "key": "U",
            "kana": "な"
        },
        {
            "key": "I",
            "kana": "に"
        },
        {
            "key": "O",
            "kana": "ら"
        },
        {
            "key": "P",
            "kana": "せ"
        },
        {
            "key": "`",
            "kana": "゛"
        },
        {
            "key": "{",
            "kana": "「"
        },
        {
            "key": "A",
            "kana": "ち"
        },
        {
            "key": "S",
            "kana": "と"
        },
        {
            "key": "D",
            "kana": "し"
        },
        {
            "key": "F",
            "kana": "は"
        },
        {
            "key": "G",
            "kana": "き"
        },
        {
            "key": "H",
            "kana": "く"
        },
        {
            "key": "J",
            "kana": "ま"
        },
        {
            "key": "K",
            "kana": "の"
        },
        {
            "key": "L",
            "kana": "り"
        },
        {
            "key": "+",
            "kana": "れ"
        },
        {
            "key": "*",
            "kana": "け"
        },
        {
            "key": "}",
            "kana": "」"
        },
        {
            "key": "Z",
            "kana": "っ"
        },
        {
            "key": "X",
            "kana": "さ"
        },
        {
            "key": "C",
            "kana": "そ"
        },
        {
            "key": "V",
            "kana": "ひ"
        },
        {
            "key": "B",
            "kana": "こ"
        },
        {
            "key": "N",
            "kana": "み"
        },
        {
            "key": "M",
            "kana": "も"
        },
        {
            "key": "<",
            "kana": "、"
        },
        {
            "key": ">",
            "kana": "。"
        },
        {
            "key": "?",
            "kana": "・"
        },
        {
            "key": "_",
            "kana": "ろ"
        }
    ]
    const type = convertTo ? 1 : 0

    let outText = ""
    for (let i = 0; i !== string.length; i++) {
        const e = (() => {
            for (let e = 0; e !== array.length; e++)
                if (string[i] === array[e][((type === 1) ? "key" : "kana")]) return e
            return null
        })()
        if (e !== null) outText += array[e][((type === 1) ? "kana" : "key")]
        else outText += string[i]
    }
    return outText
}
export default kanaConvert