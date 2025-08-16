import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";
import sharp from "sharp";
import { imageConfig } from "./image.config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distImagesDir = path.resolve(__dirname, "../dist/assets/images");

async function recompressOne(file) {
  const ext = path.extname(file).toLowerCase();
  const origStat = await fs.stat(file);
  const buf = await fs.readFile(file);

  let pipeline = sharp(buf, { sequentialRead: true });

  try {
    if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: imageConfig.quality.jpeg, mozjpeg: true });
    } else if (ext === ".png") {
      // PNGは画質パラメータではなく圧縮レベル等
      const { quality, compressionLevel } = imageConfig.quality.png_sharp;
      pipeline = pipeline.png({ quality, compressionLevel });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: imageConfig.quality.webp, effort: 6, nearLossless: false });
    } else if (ext === ".avif") {
      pipeline = pipeline.avif({ quality: imageConfig.quality.avif, effort: 6 });
    } else {
      return; // svg 等は対象外
    }

    const outBuf = await pipeline.toBuffer();

    // もし大きくなったら元のファイルを維持
    if (outBuf.length < origStat.size) {
      await fs.writeFile(file, outBuf);
      console.log(
        `✅ [postbuild] ${path.basename(file)}  ${Math.round(origStat.size / 1024)}KB → ${Math.round(outBuf.length / 1024)}KB`,
      );
    } else {
      console.log(`↩️  [postbuild] ${path.basename(file)} 圧縮無効（元の方が小）`);
    }
  } catch (e) {
    console.error(`❌ [postbuild] 失敗: ${file}`, e);
  }
}

async function main() {
  console.log("🛠️ [postbuild] dist 内画像の最終圧縮開始...");
  const files = await glob(`${distImagesDir}/**/*.{jpg,jpeg,png,webp,avif}`.replace(/\\/g, "/"));
  await Promise.all(files.map(recompressOne));
  console.log("🎉 [postbuild] 完了");
}

main();
