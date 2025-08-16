/* ==============================
 サイト全体の設定
============================== */
export const siteData = {
  title: "株式会社〇〇",
  description: "株式会社〇〇の公式サイトです。モダンな技術で最高のユーザー体験を提供します。",
  ogp: {
    type: "website",
    image: "/assets/images/service/service.png", // ルートからの絶対パス
  },
  twitter_card: "summary_large_image",
  twitter_site: "@Twitterユーザー名",
  facebook: "FacebookアプリID",
};

/* ==============================
 ページ固有の設定
 （指定ない場合、siteDataが反映される）
============================== */

export const pageData = {
  "/index.html": {
    // title: siteData.title,
    // description: siteData.description,
    // ogp: siteData.ogp,
  },
  "/service/index.html": {
    title: `事業内容 | ${siteData.title}`,
    description: "株式会社〇〇の事業内容一覧です。",
    ogp: {
      type: "article",
    },
  },
  "/contact.html": {
    title: `お問い合わせ | ${siteData.title}`,
    description: "株式会社〇〇へのお問い合わせはこちらから。",
  },
};
