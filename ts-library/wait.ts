/**
 * 待機します。ライブラリでは使用しすぎないでください。IOや高負荷の回避におすすめです。
 * @param time 時間を入力
 */
export async function wait(time: number) { await new Promise<void>(resolve => setTimeout(() => resolve(), time)) }
export default wait