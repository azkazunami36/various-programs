//ランダム数を何かしらのプログラムで生成。１以上にするとエラーになる
const randomNum = 0.43281;
//dataに内容、numに確率を入力する。
const data: { data: any, num: number }[] = [
    {
        data: "yahoo",
        num: 120
    },
    {
        data: "boinboiin",
        num: 2000
    },
    {
        data: "nyaa",
        num: 3000
    },
    {
        data: "cat",
        num: 40
    },
    {
        data: "bikkuri",
        num: 1000
    }
];
const randomMaxNum = (() => {
    let num = 0;
    for (let i = 0; i !== data.length; i++) num += data[i].num;
    return num;
})();
console.log(
    data[(() => {
        const randomSelected = randomNum * randomMaxNum;
        let selected: { num: number, no: number } | null = null;
        let maxNum: { num: number, no: number } | null = null;
        let minNum: { num: number, no: number } | null = null;
        for (let i = 0; i !== data.length; i++) {
            if (!maxNum || maxNum.num > data[i].num) maxNum = { num: data[i].num, no: i }
            if (!minNum || minNum.num < data[i].num) minNum = { num: data[i].num, no: i }
            if ()
        }
        console.log(maxNum, minNum)
        return 0;
    })()].data
)
