/*!*
 * ページ内リンクのスムーススクロール（クリック=スムース／外部着地&hashchange=即時、外部はフォーカスしない）
 *
 * 実務ポイント：
 * - 外部リンク（別ドキュメントの #）は素通し：同一ドキュメントのみ自前処理（/contact.html → /#top などを誤処理しない）
 * - 初期表示（location.hashあり）や hashchange でも JS が介入し、ヘッダー控除＋即時スクロールを実行
 * - ネイティブのフラグメント遷移がスムースになる前に、処理区間だけ scroll-behavior を 'auto' に強制
 * - クリック時は Reduced Motion を尊重して 'smooth' / 'auto' を切替、必要に応じてフォーカス（A11y）
 * - 外部着地/hashchange ではフォーカスさせない（リングも出ない）
 */

export function initSmoothScroll() {
  /*!* クリックは同一ドキュメントのアンカーだけをスムース処理 */
  document.addEventListener("click", handleClick, { capture: true });

  /*!* 初期表示で #hash があるなら、レイアウト安定後に即時で位置合わせ（フォーカスは当てない） */
  if (location.hash) {
    onNextFrame(() => alignToCurrentHashInstant());
  }

  /*!* ブラウザの戻る/進む・手入力などの hashchange にも追随（常に即時／フォーカスなし） */
  window.addEventListener("hashchange", () => {
    alignToCurrentHashInstant();
  });
}

/*!* 次フレーム実行（レイアウト安定後に位置決めしたいときに使う） */
function onNextFrame(fn) {
  requestAnimationFrame(fn);
}

/*!* 固定ヘッダーのブロックサイズ（fixed/sticky のときのみ適用） */
function getHeaderBlockSize() {
  const header = document.querySelector("[data-fixed-header]");
  if (!header) return "0";
  const { position, blockSize } = window.getComputedStyle(header);
  const isFixed = position === "fixed" || position === "sticky";
  return isFixed ? blockSize : "0";
}

/*!* スムーススクロール（クリック時用） */
function scrollToTarget(element) {
  if (element instanceof HTMLElement) {
    element.style.scrollMarginBlockStart = getHeaderBlockSize();
  }
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior = prefersReduced ? "auto" : "smooth";
  element.scrollIntoView({ behavior, block: "start", inline: "nearest" });
}

/*!* 即時スクロール（初期着地・hashchange用） */
function scrollToTargetInstant(element) {
  if (element instanceof HTMLElement) {
    element.style.scrollMarginBlockStart = getHeaderBlockSize();
  }
  withInstantBehavior(() => {
    element.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" });
  });
}

/*!* A11y：フォーカス移動（クリック時のみ使用） */
function focusTarget(element) {
  element.focus({ preventScroll: true });
  if (document.activeElement !== element) {
    element.setAttribute("tabindex", "-1");
    element.focus({ preventScroll: true });
  }
  // 任意：後始末（不要なら削除可）
  element.addEventListener(
    "blur",
    () => {
      if (element.getAttribute("tabindex") === "-1") element.removeAttribute("tabindex");
    },
    { once: true },
  );
}

/*!* クリック：同一ドキュメントのときのみスムース＋フォーカス（必要なければフォーカス行は削除） */
function handleClick(event) {
  if (event.button !== 0) return;

  const currentLink = event.target.closest?.('a[href*="#"]');
  if (!currentLink) return;

  // ここが肝：URL全体で「同一ドキュメント内か」を判定（別ページの # は素通し）
  const url = new URL(currentLink.href, location.href);
  const isSameDoc = url.origin === location.origin && url.pathname === location.pathname;
  if (!isSameDoc) return;

  const hash = url.hash;

  if (
    !hash ||
    currentLink.getAttribute("role") === "tab" ||
    currentLink.getAttribute("role") === "button" ||
    currentLink.getAttribute("data-smooth-scroll") === "disabled"
  ) {
    return;
  }

  const targetEl =
    hash === "#top" ? document.documentElement : document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!targetEl) return;

  event.preventDefault();

  scrollToTarget(targetEl);
  if (targetEl instanceof HTMLElement) focusTarget(targetEl); // ← 内部クリック時のみフォーカス

  if (hash !== "#top") {
    history.pushState({}, "", hash);
  }
}

/*!*
 * 外部着地・手入力・戻る/進む：
 * - UAのネイティブ遷移がスムースになる前に、処理区間だけ scroll-behavior を 'auto' に強制して即時で合わせる
 * - フォーカスは当てない（リングが出ない）
 */
function alignToCurrentHashInstant() {
  const { hash } = location;
  if (!hash) return;

  if (hash === "#top") {
    withInstantBehavior(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    return;
  }

  const targetEl = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!targetEl) return;

  // 画像・フォントの影響で高さが揺れる場合は、必要に応じて onNextFrame を重ねてもOK
  scrollToTargetInstant(targetEl);

  // 外部着地/hashchangeではフォーカスしない
}

/*!*
 * この関数の実行中だけ、ドキュメントのスクロール挙動を 'auto' に強制するユーティリティ。
 * - ネイティブのフラグメント遷移や他のスムース制御よりも優先して“即時”を保証するためのロジック
 */
function withInstantBehavior(fn) {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  try {
    fn();
  } finally {
    // 次フレームで元に戻す：現在のスクロールが完了してから復帰
    requestAnimationFrame(() => {
      root.style.scrollBehavior = prev;
    });
  }
}
