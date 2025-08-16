import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";
import sharp from "sharp";
import { imageConfig } from "./image.config.mjs"; // 画像変換のON/OFFや品質設定を読み込む

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 監視対象のディレクトリ（src と public の画像フォルダ）
const watchDirs = [path.resolve(__dirname, "../src/assets/images"), path.resolve(__dirname, "../public/assets/images")];

// JPEG/PNG かどうか判定
function isSourceBitmap(filePath) {
  return /\.(jpe?g|png)$/i.test(filePath);
}

// WebP 生成
function generateWebP(filePath) {
  if (!imageConfig?.convert?.webp) return; // image.config.mjs の設定で無効化可能
  if (!isSourceBitmap(filePath)) return;

  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  const webpPath = path.join(dir, `${base}.webp`);

  // 未生成の場合のみ作成
  if (!fs.existsSync(webpPath)) {
    sharp(filePath)
      .webp({ lossless: true, effort: 1 }) // 開発時は軽量・非圧縮で即時生成
      .toFile(webpPath)
      .then(() => console.log(`✅ WebP生成: ${webpPath}`))
      .catch((err) => console.error(`❌ WebP生成失敗: ${filePath}`, err));
  }
}

// AVIF 生成
function generateAVIF(filePath) {
  if (!imageConfig?.convert?.avif) return; // image.config.mjs の設定で無効化可能
  if (!isSourceBitmap(filePath)) return;

  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  const avifPath = path.join(dir, `${base}.avif`);

  // 未生成の場合のみ作成
  if (!fs.existsSync(avifPath)) {
    sharp(filePath)
      .avif({ lossless: true, effort: 1 }) // 開発時は軽量・非圧縮で即時生成
      .toFile(avifPath)
      .then(() => console.log(`✅ AVIF生成: ${avifPath}`))
      .catch((err) => console.error(`❌ AVIF生成失敗: ${filePath}`, err));
  }
}

// ファイル監視設定
function watch() {
  console.log("👀 画像の追加を監視中...");
  const watcher = chokidar.watch(watchDirs, {
    ignored: /\.webp$|\.avif$/i, // 生成ファイルは監視除外
    ignoreInitial: true, // 初期スキャン時は監視イベントを発火しない
    persistent: true,
  });

  watcher.on("add", (filePath) => {
    console.log(`📥 新規追加: ${filePath}`);
    generateWebP(filePath);
    generateAVIF(filePath);
  });
}

// 初回スキャン（既存画像にも適用）
function initialScanRecursively(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      initialScanRecursively(fullPath);
    } else if (entry.isFile()) {
      generateWebP(fullPath);
      generateAVIF(fullPath);
    }
  }
}

// 実行開始
console.log("🛠️ 初回スキャン開始...");
watchDirs.forEach(initialScanRecursively);
console.log("🎉 初回スキャン完了");
watch();
