/*!
 * debounce関数
 * 指定した関数の実行を、一定時間遅延させて最終呼び出しのみを実行する。
 * resize や scroll イベントなど頻繁に発火する処理の負荷軽減に用いる。
 *
 * @param {Function} func - 実行したい関数
 * @param {number} wait - 遅延時間（ミリ秒）
 * @returns {Function} debounce された関数
 */
export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}
