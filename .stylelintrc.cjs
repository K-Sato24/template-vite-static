/** @type {import('stylelint').Config} */
module.exports = {
  // SCSSを正しく解析する
  customSyntax: "postcss-scss",
  // CSSプロパティの順序を論理的に整頓するための、広く使われているルールセットです。
  // (例: 配置 -> ボックスモデル -> タイポグラフィ -> 見た目)
  // これを継承することで、手動で細かな順序ルールを定義することなく、
  // コードの可読性と保守性を高めることができます。
  extends: ["stylelint-config-recess-order"],

  // パフォーマンス向上のため、一度チェックしたファイルをキャッシュします。
  cache: true,

  // `stylelint`コマンド実行時に、修正可能なルールを自動で修正します。
  fix: true,

  // 個別のルール設定。
  rules: {
    // 0の後の単位(px, remなど)を許可しない (例: margin: 0px -> margin: 0)
    "length-zero-no-unit": true,
    // カラーコードを短い形式に統一 (例: #FFFFFF -> #FFF)
    "color-hex-length": "short",
    // color()関数の記法をモダンな形式に統一
    "color-function-notation": "modern",
    // font-weightを数値で表記するように強制 (例: font-weight: bold -> font-weight: 700)
    "font-weight-notation": "numeric",
    // 関数名を小文字に統一
    "function-name-case": "lower",
    // セレクタのタイプ(タグ名)を小文字に統一
    "selector-type-case": "lower",
    // 値のキーワードを小文字に統一 (例: display: BLOCK -> display: block)
    "value-keyword-case": "lower",
  },
};
