/*!*
 * 初期化処理（ページ共通）
 * - ページ全体の初期化処理を一度だけ実行
 * - リサイズ関連はここで集約
 */
import { bindDrawerInteractions, initDrawer } from "./drawer.js";
import { initHeaderShadow } from "./headerShadow.js";
import { initSmoothScroll } from "./smoothScroll.js";
import { debounce } from "./utils/debounce.js";
import { initViewport } from "./viewport.js";

if (!window.__MAIN_INITED__) {
  window.__MAIN_INITED__ = true;

  // レイアウト調整
  initViewport();

  // ドロワー（イベント登録）
  bindDrawerInteractions();

  // スクロール時にヘッダーへ影を付与
  initHeaderShadow();

  // リサイズ（PC表示用リセット等）—— 集約してdebounce
  window.addEventListener(
    "resize",
    debounce(() => {
      initDrawer();
    }, 200),
  );

  // 初回レイアウト調整
  initDrawer();

  // ページ内リンクのスムーススクロール
  initSmoothScroll();
}
