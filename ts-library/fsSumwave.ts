import fs from "fs"
import promises from "fs/promises"

/**
 * File System Sumwave
 * プログラムの安定性の向上のために、非同期処理を可能にするために作成されたものです。
 */
export namespace sfs {
    /**
     * fsからの型定義
     */
    interface StreamOptions {
        flags?: string | undefined;
        encoding?: BufferEncoding | undefined;
        fd?: number | promises.FileHandle | undefined;
        mode?: number | undefined;
        autoClose?: boolean | undefined;
        /**
         * @default false
         */
        emitClose?: boolean | undefined;
        start?: number | undefined;
        highWaterMark?: number | undefined;
    }
    /**
     * fsからの型定義
     */
    export interface ReadStreamOptions extends StreamOptions {
        end?: number | undefined;
    }
    /**
     * fsの関数を非同期関数にしたものです。
     * @param path パスを入力します。
     * @returns 
     */
    export async function exsits(path: string): Promise<Boolean> { return await new Promise(resolve => { fs.access(path, err => resolve(err === null)) }) }
    /**
     * fsの関数を非同期関数にしたものです。
     * @param path パスを入力します。
     * @returns 
     */
    export async function mkdir(path: string): Promise<boolean> { return await new Promise<boolean>(resolve => fs.mkdir(path, err => resolve(err === null))) }
    /**
     * fsの関数を非同期関数にしたものです。
     * @param path パスを入力します。
     * @returns 
     */
    export async function readFile(path: string): Promise<Buffer> { return await new Promise<Buffer>(resolve => fs.readFile(path, (err, data) => resolve(data))) }
    /**
     * fsの関数を非同期関数にしたものです。
     * @param path パスを入力します。
     * @param data 書き込む文字列を入力します。
     * @returns 
     */
    export async function writeFile(path: string, data: string | NodeJS.ArrayBufferView): Promise<void> { return await new Promise<void>(resolve => fs.writeFile(path, data, () => resolve())) }
}
export default sfs
