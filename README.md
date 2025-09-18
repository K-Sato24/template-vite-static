# Vite 静的サイト制作テンプレート

Vite を利用した、静的サイト制作用テンプレートです。
マルチページ構成、Handlebarsによるコンポーネント管理、環境変数を利用したmeta情報の一元管理、SCSSの自動集約、画像最適化、GitHub Actionsによる自動FTPデプロイなど、効率的な開発と品質維持をサポートする機能を備えています。

---

## 主な特徴

- **⚡ 高速開発サーバー**
  - Viteによる高速HMR（ホットモジュールリプレイスメント）で快適に開発。

- **📄 マルチページ対応**
  - `src` 内にHTMLファイルを追加するだけで自動的にエントリーポイントとしてビルド対象に。

- **🧩 コンポーネント管理とデータ連携**
  - Handlebarsで共通パーツ（`.hbs`）を読み込み可能。
  - `src/data/site.ts` でサイト共通のデータやページごとのデータを一元管理。
  - `src/includes/head.hbs` などでページの`<title>`や`<meta>`タグを動的に生成。

- **🌐 環境に応じたmeta情報管理**
  - Viteのモードと`.env`ファイルを利用し、ビルド時に適切な環境（ステージング/本番）のURLを自動で設定。
  - OGPなどで必須となる絶対パスを、ローカル環境を壊さずに管理可能。

- **🎨 Sass(SCSS)管理**
  - `src/assets/styles` 内の `module`, `page`, `plugins` などのディレクトリに追加したファイルを、自動的に `_index.scss` に集約し、`global.scss`から一括で読み込み可能。

- **✍️ PostCSS**
  - `postcss-preset-env` により、最新CSS構文＋ベンダープレフィックスを自動付与。

- **🧹 未使用CSSの自動削除**
  - PostCSS と PurgeCSS により、ビルド時にHTMLやJSから参照されていないCSSスタイルを自動で削除し、ファイルサイズを削減。

- **🖼️ 画像処理フローの統一**
  - **開発時**: `src/assets/images` 等のJPG/PNGを監視し、非圧縮のWebP/AVIFを自動生成。
  - **ビルド時**: `dist/assets/images` 内の画像を高品質に一括再圧縮。

- **✅ コード品質チェック**
  - HTML: Markuplint
  - CSS: Stylelint, Biome
  - SCSS: Stylelint
  - JS/TS: Biome
  - コミット時に `husky` ＋ `lint-staged` で自動実行。

---

## ディレクトリ構成

```text
my-template_vite/
├── dist/                     # ビルド後の出力先
├── public/
│   └── assets/
│       └── images/           # (オプション) 階層を維持したい画像
├── scripts/                  # ビルド/開発補助スクリプト
├── src/                      # 開発用ソースディレクトリ
│   ├── assets/
│   │   ├── images/           # (推奨) 通常の画像
│   │   ├── scripts/          # JS/TS
│   │   └── styles/           # SCSS/CSS
│   ├── data/                 # ★サイトデータ管理
│   │   └── site.ts
│   ├── includes/             # HTML共通パーツ
│   └── *.html                # 各ページHTML
├── .env.staging.example      # ★ステージング環境設定の見本
├── .env.production.example   # ★本番環境設定の見本
├── .markuplintrc             # Markuplint設定
├── .stylelintrc.cjs          # Stylelint設定
├── biome.jsonc               # Biome設定
├── package.json              # 依存関係とスクリプト
└── vite.config.ts            # Vite設定
```

---

## 使い方

### 1. 依存関係インストール
```bash
npm install
```

### 2. 環境設定ファイルの作成
ビルド時に読み込むURLを設定するため、ローカル環境に設定ファイルを作成します。

`.env.staging.example` をコピーして `.env.staging` という名前のファイルを作成し、ステージング環境のURLを設定します。
```bash
# 例: .env.staging
VITE_BASE_URL="https://staging.example.com"
```

同様に、`.env.production.example` をコピーして `.env.production` を作成し、本番環境のURLを設定します。
```bash
# 例: .env.production
VITE_BASE_URL="https://example.com"
```
> **Note:** ここで作成する`.env`ファイルは、`npm run build`などローカル環境でビルドを実行する場合にのみ使用されます。GitHub Actionsによる自動デプロイを行う際は、後述する「GitHub Actions を使った自動 FTPデプロイ構成」セクションで解説する**GitHub Secrets**に登録したURLが参照されます。

### 3. 開発サーバーの起動
```bash
npm run dev
```

### 4. ファイルのビルド (`dist`生成)

#### ローカルで手動ビルドする場合
手動FTPアップロードや、ビルド結果をローカルで確認したい場合に使用します。

- **ステージング環境向け**
  ```bash
  npm run build
  ```
- **本番環境向け**
  ```bash
  npm run build:production
  ```

#### GitHub Actionsによる自動ビルド＆デプロイ
`git push`を行うと、GitHub上で自動的にビルドとデプロイが実行されます。**ローカルでビルドコマンドを実行する必要はありません。** 詳しくは後述の「GitHub Actions」セクションを参照してください。

---

## ビルド時の最適化設定

`vite.config.ts`内の設定や環境変数を通じて、ビルド時のアセットファイル名やCSS/JSの最適化を柔軟に制御できます。

| 機能 | 説明 |
| :--- | :--- |
| **ファイル名ハッシュ** | `assets`内のファイル名にハッシュ値（例: `main-a1b2c3d4.js`）を付与し、キャッシュ効率を向上させます。 |
| **PurgeCSS** | HTML/HBS/JSファイルで使われていないCSSセレクタをビルド時に自動で削除し、CSSファイルを軽量化します。 |
| **JS圧縮** | `true`で可読性を重視した非圧縮のJSを、`false`で圧縮されたJSを生成します。非圧縮時はTerserによる整形が行われます。 |
| **CSS圧縮** | `true`で圧縮、`false`で非圧縮のCSSを生成します。 |

### 設定の優先順位
これらの機能のON/OFFは、以下の優先順位で決定されます。

1.  **GitHub Actionsの環境変数** (`.github/workflows/*.yml`)
2.  **ローカル環境変数ファイル** (`.env.staging` など)
3.  **Vite設定ファイルのデフォルト値** (`vite.config.ts`)

### 具体的な制御方法

#### 1. デフォルト設定 (`vite.config.ts`)
プロジェクト全体の基本的な挙動は、`vite.config.ts`冒頭の定数で設定します。

```ts
// vite.config.ts
const useHash = true;            // true: ハッシュ付与を有効化
const usePurge = true;           // true: PurgeCSSを有効化
const generateReadableJs = true; // false にするとJSを圧縮
const useCssMinify = false;      // true にするとCSSを圧縮
```

#### 2. 環境ごとの設定 (`.env`ファイル)
ローカルでのビルド時に特定の環境でのみ挙動を変えたい場合、`.env.staging`や`.env.production`ファイルに以下の変数を設定することで、デフォルト値を上書きできます。

```bash
# .env.staging の例

# ファイル名ハッシュを無効にする
VITE_HASH="false"

# PurgeCSSを無効にする（テスト用クラスなどを残したい場合）
VITE_PURGE="false"

# CSS圧縮を有効にする
VITE_CSS_MINIFY="true"
```
> **Note:** JSの圧縮設定は、現在 `vite.config.ts` での直接編集のみ対応しています。

#### 3. CI/CD実行時の設定 (`*.yml`ファイル)
GitHub Actionsでのデプロイ実行時に挙動を制御したい場合は、ワークフローファイル（例: `deploy-staging.yml`）の`Build`ステップに`env`ブロックを追加して上書きします。

```yaml
# .github/workflows/deploy-staging.yml の例

      - name: Build
        env:
          VITE_BASE_URL: ${{ secrets.STAGING_URL }}
          VITE_HASH: "false"
          VITE_PURGE: "false" # ステージングではPurgeCSSを無効化
        run: npm run build
```

### ファイル名ハッシュについて
このテーマは、Viteによるモダンな開発と、Viteを使わない伝統的な保守の両方に対応できるよう、2つのビルドモードを提供しています。

#### A) ハッシュを付与する場合（Viteでの継続保守）

ファイル名にハッシュを付与するビルド（`useHash: true`）では、キャッシュ効率が最大化されます。
一方で、Viteによる保守を行わない場合は、自動でハッシュが更新されないため、注意が必用です。

#### B) ハッシュを付与しない場合（納品・非Vite保守）

ファイル名にハッシュを付与しないビルド（`useHash: false`）は、Vite環境の知識がない開発者へ引き継ぐことを想定した「書き出しモード」です。

### JSのコメント保持について

ビルド後のJavaScriptファイルにコメントを残したい場合は、`/*!` で始まる特別なコメント形式を使用する必要があります。

**例:**
```javascript
/*!
 * このコメントはビルド後もファイルに保持されます。
 */
const myFunc = () => {
  // この形式のコメントは削除されます
};
```

**注意:**
この `/*! ... */` 形式のコメントは、JSの圧縮設定（`generateReadableJs: false`）が有効な場合でも、**削除されずにファイルに残ります。** 特に、外部に公開したくない情報を含めないようご注意ください。

### PurgeCSSの除外設定

JavaScriptで動的にクラスを付与する場合など、PurgeCSSに削除してほしくないCSSセレクタは、以下のいずれかの方法で除外設定を行うことができます。

#### 方法1: `vite.config.ts`で`safelist`を設定する
`vite.config.ts`内の`purgecss`設定に`safelist`オプションがあります。ここに正規表現や文字列でクラス名を登録することで、それらが常にビルド後のCSSに残るようになります。

```ts
// vite.config.ts の一部抜粋
purgecss({
  // ...
  safelist: {
    standard: [
      /^is-/,      // is-active など 'is-' で始まるクラス
      /^has-/,      // has-error など 'has-' で始まるクラス
      /^swiper-/,   // Swiper.js関連のクラス
      // 必要に応じて追加
    ],
  },
  // ...
})
```

#### 方法2: CSSファイル内でコメントで囲む
特定のルールだけを一時的に除外したい場合は、対象のCSS/SCSSコードを特別なコメントで囲みます。

```css
/* purgecss start ignore */
.my-dynamic-class {
  opacity: 1;
}
.another-one {
  color: red;
}
/* purgecss end ignore */
```

---

## 画像の取り扱い
このテンプレートでは、画像の置き場所によってビルド時の挙動が変わります。目的に応じて使い分けてください。

### A: キャッシュ効率重視（推奨）
- 置き場所: `src/assets/images`
- ビルド時: 最適化＋ファイル名ハッシュ化
- 出力: `dist/assets/images`（階層は維持されない）

### B: ディレクトリ構造維持
- 置き場所: `public/assets/images`
- ビルド時: 最適化（ハッシュ付与なし）
- 出力: `dist/assets/images`（階層維持）

### 圧縮・変換設定
- 設定ファイル: `scripts/image.config.mjs`
- 制御項目:
  - JPEG品質（mozjpeg）
  - PNG品質/圧縮レベル
  - WebP・AVIF品質
  - WebP・AVIF生成有無

### 圧縮・変換対象外にしたい画像がある場合
- faviconやOGP画像のように、圧縮・変換したくないファイルは `public` ディレクトリに保存します。
ただし、前述のとおり `public/assets/images` は圧縮・変換対象となります。

---

## 📌 meta情報の一元管理について

`<title>`や`<meta description>`、OGPといったSEO関連のタグは、`src/data/site.ts`と`src/includes/head.hbs`で一元管理されています。

### 仕組み
1.  **データ定義 (`src/data/site.ts`)**
    - `siteData`: サイト名など、全ページ共通の情報を定義します。
    - `pageData`: 各ページのパスをキーとして、ページごとの`title`や`description`を定義します。
2.  **ビルド処理 (`vite.config.ts`)**
    - **ローカル環境**: ビルド時のモード（`staging` or `production`）に応じて、対応する`.env`ファイルから`VITE_BASE_URL`を読み込みます。
    - **GitHub Actions**: `STAGING_URL`または`PRODUCTION_URL`というSecretの値を`VITE_BASE_URL`として読み込みます。
    - `siteData`と`pageData`、そして`VITE_BASE_URL`を元に、各ページで使うための完全なURL（`canonicalUrl`）などを生成します。
3.  **テンプレート出力 (`src/includes/head.hbs`)**
    - `head.hbs`内で`{{title}}`や`{{description}}`、`{{canonicalUrl}}`といった変数（Handlebars記法）を使い、動的にmetaタグを生成します。

この仕組みにより、HTMLを直接編集することなく、`site.ts`を更新するだけでサイト全体のmeta情報を安全かつ効率的に管理できます。

> **画像のパスについて:** `ogp.image`に指定するパスは、ビルド後のサイトルートから見た絶対パス（例: `/images/ogp.png`）を記述してください。`.env`ファイルに設定した`VITE_BASE_URL`が自動的に先頭に結合され、完全なURLが生成されます。


---

## 主なコマンド

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | **ステージング環境**向けにビルド |
| `npm run build:production` | **本番環境**向けにビルド |
| `npm run preview` | ビルド結果をローカルプレビュー |
| `npm run lint:html` | HTMLリント |
| `npm run lint:style` | CSS/SCSSリント＋整形 |
| `npm run lint:script` | JS/TSリント＋整形 |

---

## 🚀 GitHub Actions を使った自動 FTP デプロイ構成

### 🔧 設定手順

#### 1. GitHub Secrets の登録
FTP情報に加え、各環境のURLをSecretsに登録します。ここで登録したURLは、Actionsでのビルド時に自動で読み込まれます。

| 環境 | Secret 名 | 説明 |
| --- | --- | --- |
| Staging | `FTP_HOST`, `FTP_USER`, `FTP_PASS` | ステージング用FTP情報 |
| | `STAGING_URL` | **【ビルドに必須】** ステージングのURL（例: `https://staging.example.com`）。OGP等の絶対パス生成に使われます。 |
| Production | `PROD_FTP_HOST`, `PROD_FTP_USER`, `PROD_FTP_PASS` | 本番用FTP情報 |
| | `PRODUCTION_URL` | **【ビルドに必須】** 本番のURL（例: `https://example.com`）。OGP等の絶対パス生成に使われます。 |

> GitHub リポジトリの `Settings > Secrets and variables > Actions` から登録します。

#### 2. デプロイ用ワークフロー
- **`deploy-staging.yml`**
  - `main`ブランチへのpushでトリガー。
  - ビルドステップで`STAGING_URL`を環境変数として読み込み、`npm run build`を実行します。
- **`deploy-production.yml`**
  - `v*`タグのpushでトリガー。
  - ビルドステップで`PRODUCTION_URL`を環境変数として読み込み、`npm run build:production`を実行します。

> オプションの詳細はFTP-Deploy-Actionの公式ドキュメントをご確認ください → [https://github.com/SamKirkland/FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action)

### 🔀 ブランチ運用フロー

- 作業ブランチを作成し、ローカル（`npm run dev`）環境で開発・確認
- 問題なければ GitHub に push → PR を作成し、`main` にマージ
- `main` にマージされると `deploy-staging.yml` によりステージング環境に自動デプロイ
- ステージングでの確認完了後、タグを付けて push することで本番に自動デプロイ（`deploy-production.yml`）

#### 📘 Staging まで

- ブランチ作成
  ```bash
  git checkout -b feature/news-style
  ```
- コーディング・確認（ローカル dev）
- push & PR 作成
  ```bash
  git push origin feature/news-style
  gh pr create -t "タイトル" -b "本文" -a "@me" -l "ラベル"
  ```
  > **Note:** 上記は[GitHub CLI](https://cli.github.com/)でのコマンド例です。プルリクエストの作成は、GitHubのサイト上からも行えます。
- `main` にマージ
  ```bash
  git checkout main
  git merge feature/news-style
  git push origin main
  ```

#### 🚀 Production への反映

- タグ作成
  ```bash
  git tag v2025.08.02-initial-release
  ```
- 本番反映（GitHub Actions が `deploy-production.yml` を実行）
  ```bash
  git push origin v2025.08.02-initial-release
  ```

---

## 注意事項
- Node.js v20以上必須
