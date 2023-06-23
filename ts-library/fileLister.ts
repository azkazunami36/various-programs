import pathChecker from "./pathChecker"
import slashPathStr from "./slashPathStr"
import fs from "fs"
interface passInfo {
    /**
     * 拡張子を含まないファイル名が記載
     */
    filename: string
    /**
     * 拡張子が記載
     */
    extension: string
    /**
     * この位置までのパスが記載
     */
    pass: string
    /**
     * 相対パスでの配列での記載
     * フォルダ内のデータを移動する際に役立つ。
     */
    point: string[]
    /**
     * 元パスから配列での記載
     * データにアクセスするために役立つ。passデータとはあまり変わらない。
     */
    isPoint: string[]
}
export async function fileLister(
    /**
     * フォルダパスを入力。その中のファイルやフォルダを配列化する。
     */
    pass: string[],
    /**
     * 様々なオプションを入力
     */
    option?: {
        /**
         * フォルダ内のフォルダにアクセス、階層内のデータを読み込むかどうか
         */
        contain?: boolean,
        /**
         * 拡張子を限定し、検索範囲を絞る
         */
        extensionFilter?: string[],
        /**
         * 「.」を使った隠しファイルを検出し、検索から除外する
         */
        invFIleIgnored?: boolean,
        /**
         * 「._」を使った隠しパラメーターファイルを検出し、検索から除外する
         */
        macosInvIgnored?: boolean
    }
) {
    //オプションデータの格納用
    /**
     * フォルダ内のフォルダにアクセス、階層内のデータを読み込むかどうか
     */
    let contain = false
    /**
     * 拡張子を限定し、検索範囲を絞る
     */
    let extensionFilter: string[] = []
    /**
     * 「.」を使った隠しファイルを検出し、検索から除外する
     */
    let invFIleIgnored = false
    /**
     * 「._」を使った隠しパラメーターファイルを検出し、検索から除外する
     */
    let macosInvIgnored = false
    if (option !== undefined) {
        if (option.contain) contain = true
        if (option.extensionFilter !== undefined) extensionFilter = option.extensionFilter
        if (option.invFIleIgnored) invFIleIgnored = true
        if (option.macosInvIgnored) macosInvIgnored = true
    }

    const processd: passInfo[] = [] //出力データの保存場所
    if (!await pathChecker(pass)) return processd
    const point: string[] = [] //パス場所を設定
    /**
     * キャッシュデータの格納
     */
    const filepoint: {
        /**
         * マークとなるディレクトリのパスを入力
         * @param lpass どこのパスかを記述する
         */
        [lpass: string]: {
            /**
             * キャッシュからファイルを指定する
             */
            point: number,
            /**
             * ディレクトリやファイルリストのキャッシュを保存
             */
            dirents: fs.Dirent[]
        }
    } = {}

    while (true) {
        let lpass = pass //ファイル処理時の一時的パス場所
        for (let i = 0; i !== point.length; i++) lpass.push(point[i]) //パス解析、配列化

        //filepointの初期化
        if (!filepoint[slashPathStr(lpass)]) filepoint[slashPathStr(lpass)] = {
            point: 0,
            dirents: await new Promise(resolve => {
                fs.readdir(slashPathStr(lpass), { withFileTypes: true }, (err, dirents) => {
                    if (err) throw err
                    resolve(dirents)
                })
            })
        }
        /**
         * 保存されたリストを取得
         */
        const dirents = filepoint[slashPathStr(lpass)].dirents
        //もしディレクトリ内のファイル数とファイル指定番号が同じな場合
        if (dirents.length === filepoint[slashPathStr(lpass)].point)
            //lpassが初期値「pass + "/"」と同じ場合ループを抜ける
            if (slashPathStr(lpass) === slashPathStr(pass)) break
            //そうでない場合上の階層へ移動する
            else point.pop()
        else {
            //ファイル名の取得
            const name = dirents[filepoint[slashPathStr(lpass)].point].name
            //フォルダ、ディレクトリでない場合
            if (!dirents[filepoint[slashPathStr(lpass)].point].isDirectory()) {
                //ドットで分割
                const namedot = name.split(".")
                //拡張子を取得
                const extension = namedot[namedot.length - 1]
                if ((() => { //もしも
                    if (extensionFilter[0]) { //拡張子指定がある場合
                        let stats = false
                        for (let i = 0; i !== extensionFilter.length; i++)
                            if (extensionFilter[i].match(new RegExp(extension, "i"))) stats = true
                        if (!stats) return false //拡張子がマッチしなかったらfalse
                    }
                    //末端が一致した場合false
                    if (invFIleIgnored && name[0] === ".") return false
                    if (macosInvIgnored && name[0] === "." && name[1] === "_") return false
                    return true //全てがreturnしない場合true
                })()) processd.push({ //ファイルデータを追加
                    filename: name.slice(0, -(extension.length + 1)),
                    extension: extension,
                    pass: slashPathStr(lpass),
                    isPoint: JSON.parse(JSON.stringify([...pass, ...point])),
                    point: point
                })
                //ディレクトりの場合は階層を移動し、ディレクトリ内に入り込む
            } else if (contain && dirents[filepoint[slashPathStr(lpass)].point].isDirectory()) point.push(name)
            //次のファイルへ移動する
            filepoint[slashPathStr(lpass)].point++
        }
    }
    //データを出力
    console.log(processd)
    return processd
}
export default fileLister