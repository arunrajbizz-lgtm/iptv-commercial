export function enableTizenInputFix() {
  document.addEventListener("keydown", function (e) {
    const el = document.activeElement;

    if (!el) return;

    const isInput =
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA";

    if (isInput && (e.key === "Enter" || e.keyCode === 13)) {
      e.preventDefault();
      e.stopPropagation();

      el.focus();

      setTimeout(function () {
        el.click();
      }, 50);
    }
  });
}