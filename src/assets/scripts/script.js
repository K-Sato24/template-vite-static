/*!*
 * debounce関数
 * 指定した関数の実行を、一定時間遅延させて最終呼び出しのみを実行する。
 * resize や scroll イベントなど頻繁に発火する処理の負荷軽減に用いる。
 *
 * @param {Function} func - 実行したい関数
 * @param {number} wait - 遅延時間（ミリ秒）
 * @returns {Function} debounce された関数
 */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/*!*
 * ウィンドウ幅が375px未満の場合、viewportを固定する
 * モバイルUIのレイアウト崩れを防ぐ目的で使用。
 * リサイズイベントに対してdebounceを用い、過剰な処理を抑制。
 * ※font-sizeの単位がvwの場合は使用しないこと
 *
 */
const initializeViewport = () => {
  const handleResize = () => {
    const minWidth = 375;
    const value = window.outerWidth > minWidth ? "width=device-width,initial-scale=1" : `width=${minWidth}`;

    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && viewport.getAttribute("content") !== value) {
      viewport.setAttribute("content", value);
    }
  };

  const debouncedResize = debounce(handleResize, 250);

  window.addEventListener("resize", debouncedResize, false);
  handleResize(); // 初回実行
};

initializeViewport();

/*!*
 * ブレークポイント（desktopとmobileの切り替え幅）
 * @type {number}
 */
const breakpointMd = 768;

/*!*
 * ドロワーメニューを閉じる
 */
function closeDrawer() {
  const hamburger = document.querySelector(".js-hamburger");
  const header = document.querySelector(".js-header");
  const drawer = document.querySelector(".js-drawer");
  const body = document.body;

  hamburger.classList.remove("is-active");
  hamburger.setAttribute("aria-expanded", "false");
  header.classList.remove("is-active");
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
 * @param {MouseEvent} event
 */
function toggleDrawer(event) {
  event.stopPropagation();
  const hamburger = event.currentTarget;
  const drawer = document.querySelector(".js-drawer");
  const body = document.body;

  const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
  hamburger.setAttribute("aria-expanded", String(!isExpanded));
  hamburger.classList.toggle("is-active");
  drawer.classList.toggle("is-active");
  body.classList.toggle("is-fixed");

  const texts = document.querySelectorAll(".hamburger__text");
  texts.forEach((text) => text.classList.toggle("is-hidden"));
}

/*!*
 * スクロール時にヘッダーへ影を付与する
 */
function handleScroll() {
  const header = document.querySelector(".js-header");
  const scroll = window.scrollY;
  const thresholdAdd = 0;
  const thresholdRemove = 30;

  if (scroll > thresholdAdd) {
    header.classList.add("shadow");
  } else if (scroll < thresholdRemove) {
    header.classList.remove("shadow");
  }
}

/*!*
 * ドロワーメニューをリセットする（PC表示用）
 */
function initDrawer() {
  if (window.innerWidth >= breakpointMd) {
    closeDrawer();
  }
}

/*!*
 * ページ内リンクのスムーススクロール処理
 */
function initSmoothScroll() {
  const header = document.querySelector(".header");
  const headerOffset = header ? header.offsetHeight : 0;

  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);
      if (!target) return;

      const targetPosition = target.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = targetPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    });
  });
}

// /*!*
//  * ページトップボタンの表示・色変更処理
//  */
// function initPageTopButton() {
//   const pageTop = document.querySelector(".js-page-top");
//   const pageTopColor = document.querySelector(".js-page-top-color");
//   const footer = document.querySelector(".footer");

//   if (!pageTop || !pageTopColor || !footer) return;

//   window.addEventListener("scroll", function () {
//     const footerRect = footer.getBoundingClientRect();
//     const windowHeight = window.innerHeight;

//     // スクロール量に応じてボタン表示切り替え
//     if (window.scrollY > 100) {
//       pageTop.classList.add("is-show");
//     } else {
//       pageTop.classList.remove("is-show");
//     }

//     // フッターが画面に入ったら色変更
//     if (footerRect.top <= windowHeight) {
//       pageTopColor.classList.add("is-color");
//     } else {
//       pageTopColor.classList.remove("is-color");
//     }
//   });
// }

// /*!*
//  * FAQアコーディオンの初期化処理
//  * GSAPによるアニメーションを制御
//  * https://gsap.com/
//  * is-openedクラスで開閉状態を判定・制御
//  */
// function initAccordion() {
//   const details = document.querySelectorAll(".js-details");
//   const IS_OPENED_CLASS = "is-opened";

//   details.forEach((element) => {
//     const summary = element.querySelector(".js-summary");
//     const content = element.querySelector(".js-content");

//     summary.addEventListener("click", (event) => {
//       event.preventDefault();

//       // is-openedクラスの有無で開閉状態を判断する
//       if (element.classList.contains(IS_OPENED_CLASS)) {
//         // アコーディオンを閉じるときの処理
//         // アイコン操作用クラスを切り替える(クラスを取り除く)
//         element.classList.remove(IS_OPENED_CLASS);

//         // アニメーション実行（閉じる）
//         closingAnim(content, element).restart();
//       } else {
//         // アコーディオンを開くときの処理
//         // アイコン操作用クラスを切り替える(クラスを付与)
//         element.classList.add(IS_OPENED_CLASS);

//         // open属性を付与（アクセシビリティ対応）
//         element.setAttribute("open", "true");

//         // アニメーション実行（開く）
//         openingAnim(content).restart();
//       }
//     });
//   });
// }

// /*!*
//  * アコーディオンを閉じる時のアニメーション
//  */
// function closingAnim(content, element) {
//   return gsap.to(content, {
//     height: 0,
//     opacity: 0,
//     duration: 0.3,
//     ease: "power3.out",
//     overwrite: true,
//     onComplete: () => {
//       element.removeAttribute("open");
//     },
//   });
// }

// /*!*
//  * アコーディオンを開く時のアニメーション
//  */
// function openingAnim(content) {
//   return gsap.fromTo(
//     content,
//     { height: 0, opacity: 0 },
//     {
//       height: "auto",
//       opacity: 1,
//       duration: 0.3,
//       ease: "power3.out",
//       overwrite: true,
//     }
//   );
// }

// /*!*
//  * モーダルの初期化処理
//  * トリガー・クローズボタン・ESCキー・外クリック・背景固定等の全挙動を制御
//  */
// function initModal() {
//   const modals = document.querySelectorAll(".js-modal"); // 対象となるdialog要素（複数可）
//   const openTriggers = document.querySelectorAll("[data-modal-open]"); // モーダルを開くボタン（data属性で対象指定）
//   const eventListenersMap = new Map(); // イベントの登録状況を記録（後で解除用）
//   let currentOpenTrigger = null; // モーダルを開いたトリガー（フォーカス復元用）
//   let isTransitioning = false; // アニメーション中のフラグ（二重実行防止）

//   // モーダルを開くトリガーの登録（data属性で対象モーダルを特定）
//   openTriggers.forEach((trigger) => {
//     const modalId = trigger.dataset.modalOpen;
//     const modal = document.querySelector(
//       `.js-modal[data-modal-id="${modalId}"]`
//     );
//     if (!modal) return;

//     trigger.addEventListener("click", (e) => {
//       e.preventDefault();
//       currentOpenTrigger = trigger; // 開いたボタンを保持（閉じたときにフォーカスを戻す）
//       openModal(modal);
//     });

//     // キーボード操作かマウス操作かを判定（アクセシビリティ目的）
//     trigger.addEventListener("mousedown", handleTriggerFocus);
//     trigger.addEventListener("keydown", handleTriggerFocus);
//   });

//   // 各モーダル内のクローズボタンにイベント登録
//   modals.forEach((modal) => {
//     const closeTriggers = modal.querySelectorAll(".js-modal-close-trigger");
//     closeTriggers.forEach((trigger) => {
//       trigger.addEventListener("click", (e) => {
//         e.preventDefault();
//         closeModal(modal);
//       });
//     });
//   });

//   function handleTriggerFocus(e) {
//     // :focus-visible の挙動制御などに使う判定用フラグ（マウス or キーボード）
//     if (e.type === "mousedown") {
//       document.documentElement.setAttribute("data-mousedown", "true");
//     }
//     if (e.type === "keydown") {
//       document.documentElement.removeAttribute("data-mousedown");
//     }
//   }

//   function openModal(modal) {
//     if (isTransitioning) return; // アニメーション中は無視
//     isTransitioning = true;

//     modal.showModal(); // ネイティブAPIでモーダル表示
//     modal.removeAttribute("data-active"); // 初期状態に戻す（再表示時アニメ制御）

//     // アニメーションを発火させるために requestAnimationFrame を挟む
//     requestAnimationFrame(() => {
//       modal.setAttribute("data-active", "true"); // CSSアニメーション用
//       waitModalAnimation(modal).then(() => {
//         isTransitioning = false;
//       });
//     });

//     manageEventListeners(modal, true); // イベント登録（ESCキー、背景クリックなど）
//   }

//   async function closeModal(modal) {
//     if (isTransitioning) return;
//     isTransitioning = true;

//     modal.setAttribute("data-active", "false"); // アニメーション開始
//     manageEventListeners(modal, false); // イベント解除

//     await waitModalAnimation(modal); // アニメーション完了まで待機
//     modal.close(); // ネイティブAPIでモーダル閉じる

//     // モーダルを開いたボタンにフォーカスを戻す（アクセシビリティ考慮）
//     if (currentOpenTrigger) {
//       currentOpenTrigger.focus();
//       currentOpenTrigger = null;
//     }

//     isTransitioning = false;
//   }

//   function manageEventListeners(modal, add) {
//     // モーダル外側クリックで閉じる処理（e.target === dialog のとき）
//     const backdropClick = (e) => {
//       if (e.target === modal) closeModal(modal);
//     };

//     // ESCキーで閉じる処理
//     const keyDown = (e) => {
//       document.documentElement.removeAttribute("data-mousedown"); // アクセシビリティ属性クリア
//       if (e.key === "Escape") {
//         e.preventDefault();
//         closeModal(modal);
//       }
//     };

//     if (add) {
//       modal.addEventListener("click", backdropClick);
//       window.addEventListener("keydown", keyDown);
//       eventListenersMap.set(modal, { backdropClick, keyDown }); // 後で削除するために記録
//     } else {
//       const listeners = eventListenersMap.get(modal);
//       if (listeners) {
//         modal.removeEventListener("click", listeners.backdropClick);
//         window.removeEventListener("keydown", listeners.keyDown);
//         eventListenersMap.delete(modal);
//       }
//     }
//   }

//   function waitModalAnimation(modal) {
//     // CSSアニメーションを待機するための処理（Web Animations APIを使用）
//     const animations = modal.getAnimations();
//     if (!animations.length) return Promise.resolve([]);
//     return Promise.allSettled(animations.map((a) => a.finished));
//   }
// }

// /*!*
//  * タブ切り替え処理
//  * - aria属性を制御
//  * - 複数のタブセットに対応
//  * - マウスクリックとキーボード（左右キー）操作に対応
//  * - 初期状態のaria-selected="true"のタブを起点に表示切替
//  */
// function initTabs() {
//   const tabSets = document.querySelectorAll(".js-tabs");

//   tabSets.forEach((tabSet) => {
//     const tabs = tabSet.querySelectorAll('[role="tab"].js-tab-item');
//     const panels = tabSet.querySelectorAll('[role="tabpanel"]');

//     // 初期状態でaria-selected="true"のタブに対応するパネルを表示
//     const activeTab = tabSet.querySelector(
//       '[role="tab"].js-tab-item[aria-selected="true"]'
//     );
//     if (activeTab) {
//       const initialPanelId = activeTab.getAttribute("aria-controls");
//       panels.forEach((panel) => {
//         if (panel.id === initialPanelId) {
//           panel.classList.add("is-show");
//         } else {
//           panel.classList.remove("is-show");
//         }
//       });
//       activeTab.focus();
//     }

//     tabs.forEach((tab, index) => {
//       // クリックでタブ切り替え
//       tab.addEventListener("click", () => switchTab(index));

//       // キーボード（左右キー）でタブ切り替え
//       tab.addEventListener("keydown", (event) => {
//         if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
//           event.preventDefault();
//           const dir = event.key === "ArrowLeft" ? -1 : 1;
//           let newIndex = (index + dir + tabs.length) % tabs.length;
//           switchTab(newIndex);
//           tabs[newIndex].focus();
//         }
//       });
//     });

//     /*!*
//      * タブとパネルの状態を切り替える共通処理
//      * @param {number} newIndex - 選択するタブのインデックス
//      */
//     function switchTab(newIndex) {
//       tabs.forEach((t, i) => {
//         const selected = i === newIndex;
//         t.setAttribute("aria-selected", selected.toString());
//         t.setAttribute("tabindex", selected ? "0" : "-1");
//       });

//       const targetPanelId = tabs[newIndex].getAttribute("aria-controls");
//       panels.forEach((panel) => {
//         panel.classList.toggle("is-show", panel.id === targetPanelId);
//       });
//     }
//   });
// }

// /*!*
//  * ScrollHintの初期化処理
//  * https://appleple.github.io/scroll-hint/
//  * スクロール可能要素に補助アイコンとヒント表示を付与
//  */
// function initScrollHint() {
//   new ScrollHint(".js-scroll", {
//     i18n: {
//       scrollable: "スクロールできます",
//     },
//     remainingTime: 3000,
//     scrollHintIconAppendClass: "scroll-hint-icon_white",
//   });
// }

// /*!*
//  * 横スクロールコンテナにドラッグ操作を追加する処理
//  * スクロール可能な要素にのみカーソル変更とドラッグ挙動を付加
//  */
// function initDraggableScroll() {
//   const scrollContainers = document.querySelectorAll(".js-draggable");

//   scrollContainers.forEach((container) => {
//     let isDragging = false;
//     let startX;
//     let scrollLeft;

//     // カーソル状態を更新（スクロール可能かどうかを判定）
//     const updateCursor = () => {
//       const isScrollable = container.scrollWidth > container.clientWidth;
//       container.style.cursor = isScrollable ? "grab" : "default";
//     };

//     // 初期チェック
//     updateCursor();

//     // ウィンドウリサイズでも再チェック
//     window.addEventListener("resize", updateCursor);

//     // ドラッグ操作開始
//     container.addEventListener("mousedown", (e) => {
//       if (container.scrollWidth <= container.clientWidth) return;

//       isDragging = true;
//       startX = e.pageX - container.offsetLeft;
//       scrollLeft = container.scrollLeft;
//       container.style.cursor = "grabbing";
//       container.style.userSelect = "none";
//     });

//     // ドラッグ中の処理
//     container.addEventListener("mousemove", (e) => {
//       if (!isDragging) return;
//       const x = e.pageX - container.offsetLeft;
//       const walk = x - startX;
//       container.scrollLeft = scrollLeft - walk;
//     });

//     // ドラッグ終了（マウスアップ）
//     container.addEventListener("mouseup", () => {
//       isDragging = false;
//       updateCursor();
//       container.style.userSelect = "";
//     });

//     // カーソルが離れたときの保険処理
//     container.addEventListener("mouseleave", () => {
//       isDragging = false;
//       updateCursor();
//       container.style.userSelect = "";
//     });
//   });
// }

/*!*
 * 初期化処理
 */
function init() {
  const hamburger = document.querySelector(".js-hamburger");
  const drawerLinks = document.querySelectorAll(".js-drawer a");
  const logoLink = document.querySelector(".header__logo a");

  if (hamburger) {
    hamburger.addEventListener("click", toggleDrawer);
  }

  drawerLinks.forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });

  if (logoLink) {
    logoLink.addEventListener("click", () => {
      const drawer = document.querySelector(".js-drawer");
      if (drawer.classList.contains("is-active")) {
        closeDrawer();
      }
    });
  }

  window.addEventListener("scroll", handleScroll);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initDrawer, 200);
  });

  // レイアウト調整（最初に行う）
  initDrawer();

  // UI操作・アニメーション
  initSmoothScroll();
  // initAccordion();
  // initModal();
  // initTabs();

  // コンポーネントの表示制御
  // initPageTopButton();
  // initDraggableScroll();

  // 外部ライブラリ系
  initFvSwiper();
  initReleasesSwiper();
  // initScrollHint();
}

document.addEventListener("DOMContentLoaded", init);
