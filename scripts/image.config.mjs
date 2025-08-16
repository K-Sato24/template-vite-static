/**
 * 画像処理に関する設定を一元管理するファイル。
 * build時に、vite.config.ts (imagemin) と
 * scripts/process-public-images.mjs (sharp) の両方から参照される。
 */
export const imageConfig = {
  // 圧縮品質の設定（build 後の postbuild: sharp のみ使用）
  quality: {
    // sharp jpeg (1-100)
    jpeg: 80,
    // sharp webp (0-100)
    webp: 80,
    // sharp avif (0-100)
    avif: 50,
    // sharp png (0-100, 圧縮レベルとは異なる)
    png_sharp: { quality: 80, compressionLevel: 5 },
  },

  // build時にWebP / AVIF を生成するかどうか
  convert: {
    webp: true,
    avif: false,
  },
};
