/*!*
 * ドロワーメニューを閉じる
 * - ハンバーガー/ヘッダーが無いページでも安全に処理
 * - テキスト表示（メニュー/閉じる）を切り替え
 */
export function closeDrawer() {
  const hamburger = document.querySelector(".js-hamburger");
  const header = document.querySelector(".js-header");
  const drawer = document.querySelector(".js-drawer");
  const body = document.body;

  if (!drawer) return;

  if (hamburger) {
    hamburger.classList.remove("is-active");
    hamburger.setAttribute("aria-expanded", "false");
  }

  header?.classList.remove("is-active");
  drawer.classList.remove("is-active");
  body.classList.remove("is-fixed");

  const texts = document.querySelectorAll(".hamburger__text");
  texts.forEach((text, index) => {
    if (index === 0) {
      text.classList.remove("is-hidden");
    } else {
      text.classList.add("is-hidden");
    }
  });
}

/*!*
 * ドロワーメニューを開閉する
 * - aria-expanded を更新
 * - ハンバーガー/ドロワー/ボディの状態を切り替え
 */
function toggleByButton(hamburger) {
  const drawer = document.querySelector(".js-drawer");
  const body = document.body;
  if (!drawer) return;

  const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
  hamburger.setAttribute("aria-expanded", String(!isExpanded));

  hamburger.classList.toggle("is-active");
  drawer.classList.toggle("is-active");
  body.classList.toggle("is-fixed");

  document.querySelectorAll(".hamburger__text").forEach((text) => {
    text.classList.toggle("is-hidden");
  });
}

/*!*
 * ドロワーメニューをリセットする（PC表示用）
 * - 768px以上では常に閉じる
 */
export function initDrawer() {
  const breakpointMd = 768;
  if (window.innerWidth >= breakpointMd) {
    closeDrawer();
  }
}

/*!*
 * ドロワー関連イベントの登録
 * - ハンバーガー：クリックで開閉（イベント委譲）
 * - ドロワー内リンク：クリックで閉じる
 * - ロゴ：開いている場合は閉じる
 * - ※ ページ内で一度だけ実行
 */
export function bindDrawerInteractions() {
  if (document.documentElement.dataset.drawerDelegated === "true") return;
  document.documentElement.dataset.drawerDelegated = "true";

  // ハンバーガー
  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target.closest(".js-hamburger");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      toggleByButton(btn);
    },
    { passive: false },
  );

  // ドロワー内リンク
  document.addEventListener("click", (e) => {
    if (e.target.closest(".js-drawer a")) {
      closeDrawer();
    }
  });

  // ロゴ
  const logoLink = document.querySelector(".header__logo a");
  logoLink?.addEventListener("click", () => {
    const drawer = document.querySelector(".js-drawer");
    if (drawer?.classList.contains("is-active")) {
      closeDrawer();
    }
  });
}
