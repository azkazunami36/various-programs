#include <stdio.h>
#include <AquesTalk.h> // AquestTalk クラスのヘッダ

main(int ac, char **av)
{
int size;
// メモリ上に音声データを生成
unsigned char *wav = AquesTalk_Synthe("こんにちわ。", 100, &size);
if(wav==0) {
fprintf(stderr, "ERR %d", size); // エラー時は size にエラーコードが返る
return -1;
}
// ルートディレクトリに生成した音声データを保存
FILE *fp = fopen("¥¥ZZZ.wav", "wb");
fwrite(wav, 1, size, fp);
fclose(fp);
// Synthe()で生成した音声データは、使用後に呼び出し側で解放する
AquesTalk_FreeWave (wav);
return 0;
}

typedef struct my_handle my_handle;

typedef struct my_xy{
  double x;
  double y;
} my_xy;

my_handle *my_new(const my_xy *data, uint32_t data_count) {
  for (int i = 0; i < data_count; ++i) {
    printf("%f, %f",data[i].x, data[i].y);
  }
  
  /* 割愛 */
  return NULL;
}