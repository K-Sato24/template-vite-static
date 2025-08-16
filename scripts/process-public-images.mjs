import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";
import sharp from "sharp";
import { imageConfig } from "./image.config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 処理対象ディレクトリ
const targetDir = path.resolve(__dirname, "../public/assets/images");

// 画像を処理するメイン関数
async function processImage(filePath) {
  const source = await fs.readFile(filePath);
  const sharpInstance = sharp(source);
  const metadata = await sharpInstance.metadata();
  const { format } = metadata;

  // 1. 元画像の圧縮
  let optimizedSource = source;
  if (format === "jpeg") {
    optimizedSource = await sharpInstance.jpeg({ quality: imageConfig.quality.jpeg }).toBuffer();
  } else if (format === "png") {
    optimizedSource = await sharpInstance.png(imageConfig.quality.png_sharp).toBuffer();
  }
  await fs.writeFile(filePath, optimizedSource);
  console.log(`✅ [build] 圧縮: ${filePath}`);

  // 2. WebPの生成
  if (imageConfig.convert.webp) {
    const webpPath = filePath.replace(/\.[^/.]+$/, ".webp");
    await sharp(optimizedSource).webp({ quality: imageConfig.quality.webp }).toFile(webpPath);
    console.log(`✅ [build] WebP生成: ${webpPath}`);
  }

  // 3. AVIFの生成 (もし有効なら)
  if (imageConfig.convert.avif) {
    // AVIF処理をここに追加
  }
}

// メインの実行部分
async function run() {
  console.log("🛠️ [build] public内の画像処理を開始...");
  try {
    await fs.access(targetDir);
  } catch (e) {
    console.log("⏩ public/assets/images が存在しないためスキップします。");
    return;
  }
  const normalizedTargetDir = targetDir.replace(/\\/g, "/");
  const imagePaths = await glob(`${normalizedTargetDir}/**/*.{png,jpg,jpeg}`);
  await Promise.all(imagePaths.map(processImage));
  console.log("🎉 [build] public内の画像処理が完了しました。");
}

run().catch(console.error);
