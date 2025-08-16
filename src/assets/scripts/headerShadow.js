export function initHeaderShadow() {
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".js-header");
    if (!header) return;

    const scroll = window.scrollY;
    const thresholdAdd = 0;
    const thresholdRemove = 30;

    if (scroll > thresholdAdd) {
      header.classList.add("shadow");
    } else if (scroll < thresholdRemove) {
      header.classList.remove("shadow");
    }
  });
}
