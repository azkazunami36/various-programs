import dataIO from "./dataIO";
import sharpConvert from "./sharpConvert";

/**
 * 前期cuiIOがゴミだなぁ～と感じるようになってきたので、２世代目を作成しました。
 * １から作った方が早いものですから。
 */

export namespace cuiIO2 {
    /** クラスを実行するために必要な情報や動作を簡単に作成するための定義です。内容が空の場合は、選択肢として表示されなくなります。 */
    interface functions {
        /** 実行したいものを選択するための物です。 */
        selection?: {
            /** 実行したいものを選ぶと、それに合った動作を期待することが出来ます。 */
            [name: string]: functions
        }
        /** 
         * selectionと同時に定義することが出来ます。
         * これを定義すると、selectionで定義したリストにプラスで「データを入力する」という選択肢が追加されます。
         */
        getData?: {
            /** 格納する名前を決定します。 */
            name: string
            /** 取得するデータのタイプを決定します。 */
            type: "string" | "number" | "boolean" | "path"
            /** 必須かどうかを決定します。配列内にfunctionsと対応する名前を入力することで、判別と不正データ利用の抑制、エラーの防止につながります。 */
            required?: string[]
        }[]
        /** プログラム独自で定義されたデータの選択肢を決定させます。複数選択と単一選択のどちらかを決定することが出来ます。 */
        getFixedData?: {
            /** 格納する名前を決定します。 */
            name: string
            /** 選択してほしい項目をここに入力します。 */
            list: string[]
            /** 複数選択を可能にするかどうかを決定します。指定しない場合はFalseとなり、上書き選択となります。 */
            multiple?: boolean
            /** 必須かどうかを決定します。配列内にfunctionsと対応する名前を入力することで、判別と不正データ利用の抑制、エラーの防止につながります。 */
            required?: string[]
        }[]
        /** これが定義されていると、これ以外の全てのデータを無視して、ここに入力されている関数を実行します。 */
        function?: (
            /** 上の階層で取得したデータをfunctionで利用できるようにしたものです。 */
            data: {
                /** getDataで取得したデータです。格納名の中にどれかの種類のデータが入っています。 */
                data?: Record<string, string | boolean | dataIO.dataPath>
                /** 
                 * getFixedDataのリスト内で指定されたデータをここで確認することが出来ます。チェックが入ったものがここの配列に入ります。
                 * 第一配列にはリスト名、第二配列にはリスト内にあるアイテムの名前が入ります。 
                 */
                fixedData?: Record<string, string[]>
            }
        ) => Promise<void>
    }
    /** 型を識別します。一致しないとエラーが発生します。 */
    function typeDeter(/** 識別したいデータ */data: string | boolean | dataIO.dataPath | undefined, /** undefinedになってもよいか */required?: boolean) {
        const err = new Error()
        err.name = "型の識別異常"
        err.message = "型の識別中に予期しないデータが検出されました。"
        const req = (required !== true)
        return {
            isString() { if (typeof data === "string") { return data } else if (req) throw err },
            isBoolean() { if (typeof data === "boolean") { return data } else if (req) throw err },
            isNumber() { if (typeof data === "number") { return data as number } else if (req) throw err },
            isDataPath() {
                if (
                    typeof data !== "string"
                    && typeof data !== "boolean"
                    && typeof data !== "number"
                    && typeof data !== "undefined"
                ) { return data } else if (req) throw err
            }
        }
    }
    export namespace appBuilder {
        /** cuiIOにユーザーに利用させたい機能を簡単に提供させるための、アプリジェネレーターです。 */
        export class appGenerator {
            get id() { return this.#id }; #id: string = ""
            /** アプリを識別するために使用するIDを決定します。 */
            setId(a: string) { this.#id = a; return this }
            get function() { return this.#function }; #function: functions = {}
            /** アプリの内容や動作などを決定します。 */
            setFunctionOption(callback: (option: generatorFunctionsOption) => void) { callback(new generatorFunctionsOption(this)); return this }
        }
        interface appGeneratorClass {
            function: functions
            setFunctionOption: (callback: (option: generatorFunctionsOption) => void) => appGeneratorClass
        }
        class generatorFunctionsOption {
            cla: appGeneratorClass; constructor(t: appGeneratorClass) { this.cla = t }
            /** ユーザーに実行させたい機能を追加することが出来ます。 */
            setSelectionOption(callback: (option: generatorSelectionOption) => void) { callback(new generatorSelectionOption(this)); return this }
            /** 特殊な機能や、アプリを動作させるためのプログラムを実行することが出来ます。 */
            setFunction(a: (
                /** 上の階層で取得したデータをfunctionで利用できるようにしたものです。 */
                data: {
                    /** getDataで取得したデータです。格納名の中にどれかの種類のデータが入っています。 */
                    data?: Record<string, string | boolean | dataIO.dataPath>
                    /** 
                     * getFixedDataのリスト内で指定されたデータをここで確認することが出来ます。チェックが入ったものがここの配列に入ります。
                     * 第一配列にはリスト名、第二配列にはリスト内にあるアイテムの名前が入ります。 
                     */
                    fixedData?: Record<string, string[]>
                }
            ) => Promise<void>) { this.cla.function.function = a; return this }
            /** getDataのセットを行います。複数回実行することで、配列に追加を行うことが出来ます。 */
            setGetDataOption(callback: (option: generatorGetDataOption) => void) { callback(new generatorGetDataOption(this)); return this }
            /** getFixedDataのセットを行います。複数回実行することで、配列に追加を行うことが出来ます。プログラム独自で定義されたデータの選択肢を決定させます。複数選択と単一選択のどちらかを決定することが出来ます。 */
            setGetFixedDataOption(callback: (option: generatorGetFixedDataOption) => void) { callback(new generatorGetFixedDataOption(this)); return this }
        }
        class generatorGetDataOption {
            #data: {
                name: string;
                type: "string" | "number" | "boolean" | "path";
                required: string[];
            } = {
                    name: "",
                    type: "string",
                    required: []
                }
            cla: generatorFunctionsOption; constructor(t: generatorFunctionsOption) { this.cla = t; if (!this.cla.cla.function.getData) this.cla.cla.function.getData = []; this.cla.cla.function.getData.push(this.#data) }
            /** 変数名を決定します。 */
            setName(a: string) { this.#data.name = a; return this }
            /** 取得したい型を決定します。 */
            setType(a: "string" | "number" | "boolean" | "path") { this.#data.type = a; return this }
            /** 絶対に必要とされるFunctionの名前を入力します。複数回入力するには、この関数を複数回呼び出し、毎度入力します。 */
            setRequired(a: string) { this.#data.required.push(a); return this }
        }
        class generatorGetFixedDataOption {
            #data: {
                name: string;
                list: string[];
                multiple: boolean;
                required: string[];
            } = {
                    name: "",
                    list: [],
                    multiple: false,
                    required: []
                }
            cla: generatorFunctionsOption; constructor(t: generatorFunctionsOption) { this.cla = t; if (!this.cla.cla.function.getFixedData) this.cla.cla.function.getFixedData = []; this.cla.cla.function.getFixedData.push(this.#data) }
            /** 変数名を決定します。 */
            setName(a: string) { this.#data.name = a; return this }
            /** 選択してほしい項目を入力します。 */
            setList(a: string[]) { this.#data.list = a; return this }
            /** 複数選択を可能にするかどうかを決定します。指定しない場合はFalseとなり、上書き選択となります。 */
            setMultiple(a: boolean) { this.#data.multiple = a; return this }
            /** 絶対に必要とされるFunctionの名前を入力します。複数回入力するには、この関数を複数回呼び出し、毎度入力します。 */
            setRequired(a: string) { this.#data.required.push(a); return this }
        }
        class generatorSelectionOption {
            get function() { return this.#function }; #function: functions = {}
            cla: generatorFunctionsOption; constructor(t: generatorFunctionsOption) { this.cla = t }
            /** 機能を識別するために使用する名前を決定します。 */
            setName(a: string) { if (!this.cla.cla.function.selection) this.cla.cla.function.selection = {}; this.cla.cla.function.selection[a] = this.#function; return this }
            /** 機能の内容や動作などを決定します。 */
            setFunctionOption(callback: ((option: generatorFunctionsOption) => void)) { callback(new generatorFunctionsOption(this)); return this }
        }
    }

    export class cuiIO {
        appList: { [appName: string]: { id: string, function: functions } } = {
            "Image Resize": new appBuilder.appGenerator()
                .setId("imageResize")
                .setFunctionOption(o => o
                    .setGetDataOption(o => o.setName("imageSize").setType("number").setRequired("変換を開始する"))
                    .setGetDataOption(o => o.setName("beforePath").setType("path").setRequired("変換を開始する"))
                    .setGetDataOption(o => o.setName("afterPath").setType("path").setRequired("変換を開始する"))
                    .setGetDataOption(o => o.setName("folderContain").setType("boolean"))
                    .setGetDataOption(o => o.setName("invFileIgnore").setType("boolean"))
                    .setGetDataOption(o => o.setName("macOSFileIgnote").setType("boolean"))
                    .setGetFixedDataOption(o => o.setName("nameing").setList(sharpConvert.type).setRequired("変換を開始する"))
                    .setGetFixedDataOption(o => o.setName("type").setList(sharpConvert.extType).setRequired("変換を開始する"))
                    .setSelectionOption(o => o.setName("変換を開始する").setFunctionOption(o => o.setFunction(async data => {
                        if (data.data && data.fixedData) {
                            const nameing = sharpConvert.type.indexOf(data.fixedData["nameing"][0])
                            const type = sharpConvert.extType.indexOf(data.fixedData["type"][0])
                            const imageSize = typeDeter(data.data["imageSize"]).isNumber()
                            const beforePath = typeDeter(data.data["beforePath"]).isDataPath()
                            const afterPath = typeDeter(data.data["afterPath"]).isDataPath()
                            const folderContain = typeDeter(data.data["folderContain"], true).isBoolean()
                            const invFileIgnore = typeDeter(data.data["invFileIgnore"], true).isBoolean()
                            const macOSFileIgnote = typeDeter(data.data["macOSFileIgnote"], true).isBoolean()
                            if (!(nameing && type && imageSize && beforePath && afterPath)) throw new Error("変換に必要な情報が準備されていませんでした。")
                            const fileList = await dataIO.fileLister(beforePath, { contain: folderContain, extensionFilter: ["png", "jpg", "jpeg", "tiff"], invFileIgnored: invFileIgnore, macosInvIgnored: macOSFileIgnote })
                            const convert = new sharpConvert()
                            convert.afterPass = afterPath
                            convert.nameing = nameing
                            convert.size = imageSize
                            convert.processd = fileList
                            convert.type = (type === 0) ? 0 : 1
                            console.log("変換を開始しました。")
                            await new Promise<void>(resolve => { convert.on("end", () => { resolve() }) })
                            console.log("変換が完了しました。")
                        } else throw new Error("変換に必要な情報が準備されていませんでした。")
                    })))
                )
        }
    }
}
