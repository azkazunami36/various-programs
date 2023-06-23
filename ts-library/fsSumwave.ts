import fs from "fs"
export namespace sfs {
    /**
     * fsの関数を非同期関数にしたものです。
     * @param pass パスを入力します。
     * @returns 
     */
    export async function exsits(pass: string): Promise<Boolean> { return await new Promise(resolve => { fs.access(pass, err => resolve(err === null)) }) }
    /**
     * fsの関数を非同期関数にしたものです。
     * @param pass パスを入力します。
     * @returns 
     */
    export async function mkdir(pass: string): Promise<boolean> { return await new Promise<boolean>(resolve => fs.mkdir(pass, err => resolve(err === null))) }
    /**
     * fsの関数を非同期関数にしたものです。
     * @param pass パスを入力します。
     * @returns 
     */
    export async function readFile(pass: string): Promise<Buffer> { return await new Promise<Buffer>(resolve => fs.readFile(pass, (err, data) => resolve(data))) }
    /**
     * fsの関数を非同期関数にしたものです。
     * @param pass パスを入力します。
     * @param data 書き込む文字列を入力します。
     * @returns 
     */
    export async function writeFile(pass: string, data: string): Promise<void> { return await new Promise<void>(resolve => fs.writeFile(pass, data, () => resolve())) }
        /**
     * 半角と全角を区別し、それにあった文字列を算出します。
     * 半角を1、全角を2文字とします。
     * @param string 文字列を入力します。
     * @returns 
     */
}
export default sfs