/**
 * # Music Manager
 * 音楽を管理します。様々なツールを利用し、アルバムやアーティストの設定・管理、音質の選択等、様々な音楽管理として重要なものがそろっています。  
 * YouTube Downloaderと主に連携をしており、アルバムアートワークや音声はそこで管理されます。追加した際にはYouTube Downloaderに処理を任すことがほとんどです。
 */
export namespace musicManager {
    /**
     * アルバムを定義し、関連付けるための補助となる情報や説明となります。  
     * アルバム名、アルバムアーティスト名が同じアルバムを見つけた場合、関連付けられます。さらに、アーティスト名で同じものがある場合、アーティストとして記録することもできます。
     */
    export interface mp3Tag {
       /**
        * 曲名を入力します。
        */
       title: string
       /**
        * 曲名の読みを入力します
        */
       readTitle: string
       /**
        * アーティスト名を入力します。
        */
       artist: string
       /**
        * アーティスト名の読みを入力します。
        */
       readArtist: string
       /**
        * アルバム名を入力します。
        */
       albumTitle: string
       /**
        * アルバム名の読みを入力します。
        */
       readAlbumTitle: string
       /**
        * アルバムの作成者を入力します。
        */
       albumArtist: string
       /**
        * アルバムの作成者の読みを入力します。
        */
       readAlbumArtist: string
       /**
        * 作曲者名を入力します。
        */
       composer: string
       /**
        * 作曲者名の読みを入力します。
        */
       readComposer: string
       /**
        * トラック番号を入力します。
        */
       trackNo: number
       /**
        * トータルのトラック数を入力します。
        */
       totalTrackNo: number
       /**
        * ディスク番号を入力します
        */
       diskNo: number
       /**
        * トータルのディスク数を入力します。
        */
       totalDiskNo: number
       /**
        * 作成した年を入力します。
        */
       year: number
       /**
        * BPMを入力します。
        */
       bpm: number
       /**
        * ジャンルを入力します。
        */
       genre: string
       /**
        * コピーライトを入力します。
        */
       copyright: string
   }
    class musicManager {}
}
export default musicManager
