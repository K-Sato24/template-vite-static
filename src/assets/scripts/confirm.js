document.addEventListener("DOMContentLoaded", () => {
  /*!*
   * クラス名やセレクタの定義を一元管理
   */
  const FORM_CONFIG = {
    contactSection: ".form__contact", // 入力画面全体のラッパー要素
    confirmSection: ".form__confirm", // 確認画面全体のラッパー要素
    confirmButton: ".js-confirm-button input", // 「確認する」ボタンのセレクタ
    backButton: ".js-back-button input", // 「戻る」ボタンのセレクタ
    requiredSelector: '[aria-required="true"]', // 必須入力フィールドのセレクタ（バリデーションに使用）
    inputSelectors: [
      ".form__textfield", // テキスト入力
      ".form__date", // 日付入力
      ".form__file", // ファイルアップロード
      ".form__radio input", // ラジオボタン
      ".form__select", // セレクトボックス
      ".form__textarea", // テキストエリア
      ".form__checkbox input", // チェックボックス
    ].join(", "), // 各入力要素をまとめたセレクタ文字列
    dateFormat: "YYYY/MM/DD", // or "YYYY-MM-DD"（dateがある場合のみ）
    checkboxSeparator: " / ", // チェックボックスの表示区切り（複数選択のチェックボックスがある場合のみ）
  };

  /*!*
   * 確認画面に値を表示する関数
   * @param {string} name - フォーム項目のname属性
   * @param {string|array} value - 入力された値
   * @param {boolean} isCheckbox - チェックボックスかどうか
   */
  function setConfirmValue(name, value, isCheckbox = false) {
    const cleanName = name.replace(/\[\]$/, ""); // name属性の [] を除去
    const target = document.querySelector(`.confirm-${cleanName}`);
    if (!target) return;

    if (isCheckbox) {
      target.textContent = Array.isArray(value) ? value.join(FORM_CONFIG.checkboxSeparator) : value;
      return;
    }

    // 該当nameのtextareaが存在するか確認（textareaはtype属性がないためセレクタで確認）
    const isTextarea = document.querySelector(`textarea[name="${name}"]`) !== null;

    if (isTextarea) {
      // textareaは改行を維持して安全に表示
      target.innerHTML = escapeAndConvertNewlines(value);
    } else {
      target.textContent = value;
    }
  }

  /*!*
   * HTMLエスケープ＋改行変換
   * 改行（\n）を <br> に変換しつつ、HTMLタグを無効化する
   */
  function escapeAndConvertNewlines(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/\n/g, "<br>");
  }

  /*!*
   * ファイルのパスからファイル名のみを抽出
   * C:\\fakepath\\filename.jpg → filename.jpg
   * /user/home/file.png → file.png
   */
  function extractFileName(path) {
    if (typeof path !== "string") return "";
    return path.split(/[/\\\\]/).pop(); // / または \ どちらでも対応
  }

  // 初期状態で選択済みのラジオボタンを確認画面に反映（存在確認あり）
  const radioButtons = document.querySelectorAll('[type="radio"]:checked');
  if (radioButtons.length > 0) {
    radioButtons.forEach((button) => {
      setConfirmValue(button.name, button.value);
    });
  }

  // 入力フィールドの内容が変更された場合の処理
  const formInputs = document.querySelectorAll(FORM_CONFIG.inputSelectors);
  formInputs.forEach((input) => {
    input.addEventListener("change", function () {
      const val = this.value;
      const type = this.getAttribute("type");
      const name = this.name;

      // ラジオボタンの場合の処理
      if (type === "radio") {
        if (this.checked) {
          setConfirmValue(name, val);
        }
      }
      // チェックボックスの場合の処理
      else if (type === "checkbox") {
        const allChecked = document.querySelectorAll(`input[name="${name}"]:checked`);
        if (allChecked.length > 0) {
          const values = Array.from(allChecked).map((el) => el.value);
          setConfirmValue(name, values, true);
        }
      }
      // ファイルアップロードの場合の処理
      else if (type === "file") {
        const fileName = extractFileName(this.value);
        setConfirmValue(name, fileName);
      }
      // 日付の場合の処理
      else {
        if (name === "date") {
          const separator = FORM_CONFIG.dateFormat.includes("/") ? "/" : "-";
          const formatted = val.replace(/-/g, separator);
          setConfirmValue(name, formatted);
          // その他の場合の処理
        } else {
          setConfirmValue(name, val);
        }
      }
    });
  });

  // 確認ボタンをクリックした場合の処理
  const confirmButton = document.querySelector(FORM_CONFIG.confirmButton);
  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      document.querySelector(FORM_CONFIG.contactSection).style.display = "none";
      document.querySelector(FORM_CONFIG.confirmSection).style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 戻るボタンをクリックした場合の処理
  const backButton = document.querySelector(FORM_CONFIG.backButton);
  if (backButton) {
    backButton.addEventListener("click", () => {
      document.querySelector(FORM_CONFIG.contactSection).style.display = "block";
      document.querySelector(FORM_CONFIG.confirmSection).style.display = "none";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 必須項目が変更された場合の処理
  const requiredInputs = document.querySelectorAll(FORM_CONFIG.requiredSelector);
  requiredInputs.forEach((input) => {
    input.addEventListener("input", () => {
      let flag = true;
      requiredInputs.forEach((requiredInput) => {
        if (requiredInput.value === "") {
          flag = false;
        }
      });
      if (confirmButton) {
        confirmButton.disabled = !flag;
      }
    });
  });

  // 送信完了時にサンクスページへ遷移（data-thanks-url 属性を優先して使用）
  document.addEventListener(
    "wpcf7mailsent",
    (event) => {
      const wrapper = event.target.closest("[data-thanks-url]");
      const redirectUrl = wrapper?.getAttribute("data-thanks-url");
      if (redirectUrl) {
        location.href = redirectUrl;
      }
    },
    false,
  );

  // // 送信完了時にサンクスページへ遷移（ハードコーディングで指定する場合）
  // document.addEventListener(
  //   "wpcf7mailsent",
  //   (event) => {
  //     location.href = "http://template01.local/contact/thanks/";
  //   },
  //   false
  // );
});
