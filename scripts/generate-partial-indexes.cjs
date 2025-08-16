const fs = require("fs");
const path = require("path");
const glob = require("glob");

// 自動生成対象ディレクトリ一覧
const targets = ["src/assets/styles/module", "src/assets/styles/plugins", "src/assets/styles/page"];

targets.forEach((targetDir) => {
  const indexPath = path.resolve(path.join(targetDir, "_index.scss"));

  // 対象ディレクトリ内の _*.scss を収集。ただし自身（_index.scss）は除外）
  const files = glob
    .sync(`${targetDir}/**/_*.scss`)
    .filter((file) => path.resolve(file) !== indexPath)
    .map((file) => {
      // 相対パスに変換して @forward 用のパスを生成
      const relative = "./" + path.relative(targetDir, file).replace(/\\/g, "/");
      return `@forward '${relative}';`;
    });

  // _index.scss に書き出し（空でもファイルは更新されるが、中身は空）
  const content = files.join("\n") + (files.length > 0 ? "\n" : "");
  fs.writeFileSync(indexPath, content, "utf8");
  console.log(`✅ ${indexPath} generated with ${files.length} entries`);
});
