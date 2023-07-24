/**
 * 自分で作ろうとしたけど、結果的に無念のChatGPTによるコード作成をすることになってしまったものをここにおきます。  
 * つまり、無念のコードです。丸コピで僕の力はありません。が、コメントが僕のコメントになることがあります。
 * ここのプログラムは使わない可能性もあります。がメモとして保存しておくためのGPTもの置き場として利用することもあり得ます。
 */
export namespace chatGPTCode {
    /**
     * 公開鍵と秘密鍵の作成、暗号と復号を行うために必要なものが全て揃っています。  
     * 参考  
     * [Wikipedia - 公開鍵暗号](https://ja.wikipedia.org/wiki/%E5%85%AC%E9%96%8B%E9%8D%B5%E6%9A%97%E5%8F%B7)  
     * [東京大学工学部計数工学科 - 公開鍵暗号の数理（１回目）](https://www.gavo.t.u-tokyo.ac.jp/~mine/japanese/IT/Takagi_20181217.pdf)  
     * [RSA暗号の仕組みと安全性・具体例](https://manabitimes.jp/math/1146)  
     * [「共通鍵方式」「公開鍵方式」の鍵数の計算方法](https://www.pesia-one.com/entry/2019/11/08/180000)  
     */
    export namespace RSA {
        /**
         * 素数かどうか判定する関数
         */
        function isPrime(n: number): boolean {
            if (n <= 1) return false; // 1以下は素数ではない
            if (n == 2) return true; // 2は素数
            if (n % 2 == 0) return false; // 偶数は素数ではない
            // 3以上の奇数で割り切れるかどうか調べる
            for (let i = 3; i * i <= n; i += 2) {
                if (n % i == 0) return false;
            }
            return true;
        }

        /**
         * n未満のランダムな素数を生成する関数
         */
        function randomPrime(n: number): number {
            let p: number;
            do {
                p = Math.floor(Math.random() * n); // n未満のランダムな整数を生成
            } while (!isPrime(p)); // 素数になるまで繰り返す
            return p;
        }

        /**
         * aとbが互いに素かどうか判定する関数
         */
        function isCoprime(a: number, b: number): boolean {
            // 最大公約数が1なら互いに素
            return gcd(a, b) == 1;
        }

        /**
         * aとbの最大公約数を求める関数（ユークリッドの互除法
         * かずなみ追記、再帰的になるコードだったものを修正した。
         */
        function gcd(a: number, b: number): number {
            let ta = a, tb = b;
            while (true) {
                if (tb == 0) return ta; // bが0ならaが最大公約数
                const tmpa = ta, tmpb = tb
                ta = tmpb, tb = tmpa% tmpb // aをbで割った余りとbの最大公約数を求める
            }
        }

        /**
         * ax + by = gcd(a, b)となるようなxとyを求める関数（拡張ユークリッドの互除法）
         */
        function extGcd(a: number, b: number): [number, number] {
            if (b == 0) return [1, 0]; // bが0ならx=1, y=0
            let [x, y] = extGcd(b, a % b); // 再帰的に解を求める
            [x, y] = [y, x - Math.floor(a / b) * y]; // xとyを更新する
            return [x, y];
        }

        /**
         * aとmが互いに素なときに、ax ≡ 1 (mod m)となるようなxを求める関数
         */
        function modInv(a: number, m: number): number {
            let [x, y] = extGcd(a, m); // 拡張ユークリッドの互除法で解を求める
            x %= m; // xをmで割った余りにする
            if (x < 0) x += m; // xが負ならmを足して正にする
            return x;
        }

        /**
         * a^b mod m を求める関数（高速べき乗法）
         */
        function modPow(a: number, b: number, m: number): number {
            if (b == 0) return 1; // bが0なら1を返す
            if (b % 2 == 0) {
                // bが偶数なら、a^b mod m = (a^2)^b/2 mod mとして計算する
                let c = modPow(a * a % m, b / 2, m);
                return c;
            } else {
                // bが奇数なら、a^b mod m = a * a^(b-1) mod mとして計算する
                let c = modPow(a, b - 1, m);
                return (a * c) % m;
            }
        }

        /**
         * RSA暗号の鍵を作成する関数
         * @param num 暗号する数字データの最大数を設定
         */
        export function generateKey(num: number): [number, number, number] {
            // 大きな素数pとqをランダムに生成する
            let p = randomPrime(num); // 例えば、num未満の素数を生成する
            let q = randomPrime(num); // pとは異なる素数になるようにする
            while (p == q) {
                q = randomPrime(num);
            }
            // n = pqとする
            let n = p * q;
            // l = (p-1)(q-1)とする
            let l = (p - 1) * (q - 1);
            // lと互いに素なk_1をランダムに生成する
            let k_1 = randomPrime(l); // l未満の素数を生成する
            while (!isCoprime(k_1, l)) {
                // lと互いに素になるまで繰り返す
                k_1 = randomPrime(l);
            }
            // k_1 k_2 ≡ 1 (mod l)を満たすk_2を求める
            let k_2 = modInv(k_1, l);
            // nとk_1が公開鍵、k_2が秘密鍵
            return [n, k_1, k_2];
        }

        /**
         * RSA暗号でメッセージを暗号化する関数
         */
        export function encrypt(message: number, publicKey: [number, number]): number {
            // 公開鍵からnとk_1を取り出す
            let [n, k_1] = publicKey;
            // 暗号文はmessage^k_1 mod nで求められる
            let cipher = modPow(message, k_1, n);
            return cipher;
        }

        /**
         * RSA暗号で暗号文を復号化する関数
         */
        export function decrypt(cipher: number, privateKey: [number, number]): number {
            // 秘密鍵からnとk_2を取り出す
            let [n, k_2] = privateKey;
            // メッセージはcipher^k_2 mod nで求められる
            let message = modPow(cipher, k_2, n);
            return message;
        }

        /**
         * 文字列をCode Unit(16進数)にして返す。サイト: [JavaScript Primer - 文字列とUnicode](https://jsprimer.net/basic/string-unicode/)  
         * かずなみアレンジ、必ず8文字分割で帰ってくる。
         */
        export function convertCodeUnits(str: string) {
            let codeUnits: string = "";
            for (let i = 0; i < str.length; i++) {
                let numstr = String(str.charCodeAt(i))
                while (numstr.length < 8) numstr = "0" + numstr
                codeUnits += numstr;
            }
            return Number(codeUnits);
        }

        /**
         * Code Unit(16進数)を文字列にして返す
         */
        export function convertStrings(str: string) {
            const data: string[] = []
            for (let i = 0; i < Number((str.length / 8).toFixed()); i++) 
                data.push(str.slice(8 * i, 8 * (i + 1)));
            let ostr = "";
            for (let i = 0; i < data.length; i++) 
                ostr += String.fromCharCode(Number(data[i]));
            return ostr;
        }
    }
}
export default chatGPTCode
