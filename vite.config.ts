// -----------------------------------------------------------------------------
// 必要なモジュールのインポート
// -----------------------------------------------------------------------------
import path from "node:path"; // Node.js 標準の path
import { resolve } from "node:path";
import purgecssModule from "@fullhuman/postcss-purgecss";
import { glob } from "glob"; // HTML エントリ検出
import postcssPresetEnv from "postcss-preset-env";
import { defineConfig, loadEnv } from "vite";
import handlebars from "vite-plugin-handlebars";
import { pageData, siteData } from "./src/data/site";

// CJS/ESM 差吸収（常に関数として扱えるように）
// NOTE: default 有無を型安全に吸収するユーティリティ
function getDefault<T>(mod: T | { default: T }): T {
  return (mod as { default?: T }).default ?? (mod as T);
}
const purgecss = getDefault(purgecssModule);

// -----------------------------------------------------------------------------
// ディレクトリ定義
// -----------------------------------------------------------------------------
const dir = {
  src: "src", // ソース（HTML / JS / SCSS）
  publicDir: "public", // 静的アセット置き場（ビルド時そのまま dist へコピー）
  outDir: "dist", // ビルド出力先
};

// -----------------------------------------------------------------------------
// HTML ファイルを entry として収集
// -----------------------------------------------------------------------------
function getHtmlInputs(rootDir: string) {
  const files = glob.sync(`${rootDir}/**/*.html`);
  return Object.fromEntries(
    files.map((file) => [
      path
        .relative(rootDir, file)
        .replace(/\\/g, "/")
        .replace(/\.html$/, ""),
      path.resolve(file),
    ]),
  );
}

// -----------------------------------------------------------------------------
// トグル：ハッシュ付与 / PurgeCSS / JS圧縮 / CSS圧縮（基本スイッチ）
// - ふだんはこのフラグで運用。必要に応じて .env / CI で上書き可能
// -----------------------------------------------------------------------------
const useHash = true; // true: ファイル名にハッシュ付与 / false: 付与しない
const usePurge = true; // true: 未使用CSS削除を有効 / false: 無効
const generateReadableJs = true; // true: 可読性を重視したJSを生成 / false: 通常の圧縮JSを生成
const useCssMinify = false; // true: CSS を圧縮（minify） / false: 圧縮しない

// 環境変数の "true/false/on/off/1/0" を素直に解釈する小関数
function resolveToggle(defaultVal: boolean, envVal?: string): boolean {
  if (!envVal) return defaultVal;
  const v = String(envVal).trim().toLowerCase();
  if (["true", "on", "1"].includes(v)) return true;
  if (["false", "off", "0"].includes(v)) return false;
  return defaultVal; // それ以外の値は無視して既定値
}

// -----------------------------------------------------------------------------
// Vite 設定
// -----------------------------------------------------------------------------
export default defineConfig(({ mode }) => {
  // .env（staging / production / それ以外）から BASE_URL を取得し、末尾の / を除去
  const envFile = loadEnv(mode, process.cwd(), ""); // .env.* から（ローカル用）

  // Node の環境変数は string | undefined、loadEnv は Record<string, string>
  const getEnv = (k: string): string | undefined => {
    const fromProcess = process.env[k as keyof NodeJS.ProcessEnv];
    return (typeof fromProcess === "string" ? fromProcess : undefined) ?? envFile[k];
  };

  // CIの env → .env → siteData.url の優先順で baseUrl を決定
  const siteUrl = (siteData as { url?: string }).url;
  const rawBaseUrl =
    getEnv("VITE_BASE_URL") ?? // CI（Actions の env）や .env.* から
    siteUrl ?? // 予備（site.ts に url があれば）
    "";

  const baseUrl = String(rawBaseUrl).replace(/\/+$/, ""); // 末尾スラッシュ正規化

  // 末尾/先頭スラッシュをうまく繋いで URL を結合
  const joinUrl = (base: string, p: string) => {
    const b = (base || "").replace(/\/+$/, "");
    const raw = p || "";
    if (raw === "/" || raw === "") return b ? `${b}/` : "/";
    const cleaned = raw.replace(/^\/+/, "");
    return b ? `${b}/${cleaned}` : `/${cleaned}`;
  };

  // ===== トグルの最終決定 =====
  const hashEnabled = resolveToggle(useHash, getEnv("VITE_HASH"));
  const purgeEnabled = resolveToggle(usePurge, getEnv("VITE_PURGE"));
  const cssMinifyEnabled = resolveToggle(useCssMinify, getEnv("VITE_CSS_MINIFY"));
  // 可読性JS生成フラグから、minify 有効/無効フラグを決定
  const minifyEnabled = !generateReadableJs;

  // 実行ログ（混乱したら有効化）
  console.log(
    `[build] mode=${mode} hash=${hashEnabled} purgecss=${purgeEnabled} jsmin=${minifyEnabled} cssmin=${cssMinifyEnabled}`,
  );

  // ===== PostCSS プラグインの構築 =====
  const postcssPlugins = [postcssPresetEnv({ stage: 3 })];

  if (purgeEnabled) {
    console.log("[purgecss] enabled");
    postcssPlugins.push(
      purgecss({
        content: ["./src/**/*.html", "./src/**/*.hbs", "./src/**/*.mustache", "./src/**/*.{js,ts}", "./**/*.php"],
        safelist: {
          standard: [/^is-/, /^has-/, /^active/, /^open/, /^current-/, /^menu-/, /^swiper-/],
        },
        keyframes: true,
        fontFace: true,
        variables: false,
      }),
    );
  }

  return {
    // プロジェクトのルート
    root: dir.src,

    // 相対パスでビルド出力されるようにする
    base: "",

    // public フォルダはルートと並列に置く
    publicDir: `../${dir.publicDir}`,

    // ------------------ Plugins ------------------
    plugins: [
      handlebars({
        // partials の場所
        partialDirectory: resolve(__dirname, "src/includes"),
        // ページごとの meta 情報を付与する context 関数
        context: (pagePath) => {
          // 絶対パス → "/index.html" / "/dir/index.html" 形式に正規化
          const rel = pagePath.replace(/\\/g, "/").replace(/^.*?\/src\//, "/");

          // ページ専用データがあれば取得
          const currentPageData = pageData[rel] || {};

          // ページ > サイト でマージ（ogp はネストを深くマージ）
          const context = {
            ...siteData,
            ...currentPageData,
            ogp: {
              ...(siteData.ogp ?? {}),
              ...((currentPageData as Partial<{ ogp?: Record<string, string> }>).ogp ?? {}),
            },
          };

          // canonical: /index.html → "/", 下層 /foo/index.html → "/foo/"
          const pathForUrl = rel === "/index.html" ? "/" : rel.replace(/\/index\.html$/, "/");
          context.canonicalUrl = joinUrl(baseUrl, pathForUrl);

          // OGP画像: 相対/ルート相対を絶対URLに変換
          if (context.ogp?.image && !/^https?:\/\//.test(context.ogp.image)) {
            const normalized = `/${context.ogp.image.replace(/^\.?\//, "")}`;
            context.ogp.image = joinUrl(baseUrl, normalized);
          }

          // og:site_name 用（ページタイトルと分離したい場合）
          context.siteTitle = siteData.title;

          // ステージングモード判定フラグ
          context.isStaging = mode === "staging";

          return context;
        },
      }),
    ],

    // ------------------ Build ------------------
    build: {
      outDir: `../${dir.outDir}`,
      emptyOutDir: true,
      assetsInlineLimit: 0, // 画像を Base64 にインライン化しない
      write: true,
      // modulePreload: { polyfill: false }, //ポリフィルの有無

      minify: minifyEnabled ? "esbuild" : "terser",
      cssMinify: cssMinifyEnabled ? "esbuild" : false,
      // buildではソースマップを生成しない（devのみ）
      sourcemap: false,
      cssCodeSplit: true,
      esbuild: minifyEnabled
        ? {
            // 圧縮ビルド時は、ソースコード内のコメントをすべて削除
            legalComments: "none",
          }
        : undefined,
      terserOptions: {
        compress: false,
        mangle: false,
        format: {
          beautify: true,
          comments: "all",
        },
      },

      rollupOptions: {
        // generateReadableJs が true の場合、ツリーシェイクを無効にする
        treeshake: !generateReadableJs,
        input: getHtmlInputs(path.resolve(__dirname, dir.src)),
        output: {
          // エントリーポイント名をファイル名に使用する場合
          // entryFileNames: hashEnabled ? "assets/scripts/[name]-[hash].js" : "assets/scripts/[name].js",
          // chunkFileNames: hashEnabled ? "assets/scripts/[name]-[hash].js" : "assets/scripts/[name].js",
          // 任意の文字列をファイル名に使用する場合
          entryFileNames: hashEnabled ? "assets/scripts/script-[hash].js" : "assets/scripts/script.js",
          chunkFileNames: hashEnabled ? "assets/scripts/script-[hash].js" : "assets/scripts/script.js",
          assetFileNames: ({ name }) => {
            if (name && /\.(gif|jpe?g|png|svg|webp|avif)$/.test(name)) {
              return hashEnabled ? "assets/images/[name]-[hash][extname]" : "assets/images/[name][extname]";
            }
            // エントリーポイント名をファイル名に使用する場合
            // if (name && /\.css$/.test(name)) {
            //   return hashEnabled ? "assets/styles/[name]-[hash][extname]" : "assets/styles/[name][extname]";
            // }
            // 任意の文字列をファイル名に使用する場合
            if (name && /\.css$/.test(name)) {
              return hashEnabled ? "assets/styles/styles-[hash][extname]" : "assets/styles/styles[extname]";
            }
            return hashEnabled ? "assets/styles-[hash][extname]" : "assets/styles[extname]";
          },
        },
      },
    },

    // ------------------ CSS ------------------
    css: {
      devSourcemap: true,
      postcss: {
        plugins: postcssPlugins,
        // 開発時のみソースマップを生成
        map: mode === "development",
      },
    },

    // ------------------ alias ------------------
    resolve: {
      alias: {
        "@": path.resolve(__dirname, dir.src),
      },
    },

    // ------------------ dev server ------------------
    server: {
      open: true,
    },
  };
});
