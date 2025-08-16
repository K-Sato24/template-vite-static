import { debounce } from "./utils/debounce.js";

/*!*
 * ウィンドウ幅が375px未満の場合、viewportを固定する
 * モバイルUIのレイアウト崩れを防ぐ目的で使用。
 * リサイズイベントに対してdebounceを用い、過剰な処理を抑制。
 * ※font-sizeの単位がvwの場合は使用しないこと
 */
export function initViewport() {
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
}
