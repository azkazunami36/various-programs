#include <iostream> // stdを使うために
#include <string.h> // stringを使うために
#include <cstdlib>  // 乱数を扱うために
using namespace std;

// 練習用
namespace training_1
{
    class am // クラス
    {
        // プライベートエリア
        string test;
        string test2;

    public:             // public以降はパブリックエリアになります
        am(string data) // class名と同じ名前にすることで、constructorと同じ動きになります。
        {
            test = data;
        }
        void ee() const // voidの関数。constを使うと、上書きをしないための印となります。要するにjavascriptと同じですね。わかりやすいね！
        {
            cout << test << "!?" << endl;
        }
    };

    class Neko
    {
    private: // private:は省略することもできる
        string name;

    public:
        Neko(string s)
        {
            name = s;
        }
        void naku()
        {
            cout << "nya. my name is " << name << "." << endl;
        }
        void sakebu();
    };
    void Neko::sakebu()
    {
        cout << "nyanyanyaaaaaaaa!!! MY NAME IS " << name << "!!!!!!!!!" << endl;
    };
    void training()
    {
        int test1;    // 復習として。int=number
        string test2; // stringはそのまんま

        Neko nya("big");
        nya.naku();
        nya.sakebu();
        am neo("data");
        neo.ee();
    }
}
namespace training_2
{
    class test
    {
        int data;

    public:
        test(int s)
        {
            data = s;
        }
        void plus(int s)
        {
            data += s * 2;
        }
        int datas()
        {
            return data;
        }
    };
    void log(string d)
    {
        cout << d << endl;
    }
    void log(int d)
    {
        cout << d << endl;
    }
    void training()
    {
        test mebiya(10);
        mebiya.plus(10);
        cout << mebiya.datas() << endl;
        if (mebiya.datas() >= 40)
        {
            log("ok");
        }
        else
        {
            mebiya.plus(rand());
            log(mebiya.datas());
        }
    };
}
// 練習用終端
int main()
{
    training_1::training();
    training_2::training();
}