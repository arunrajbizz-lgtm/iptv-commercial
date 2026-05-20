export function enableTizenInputFix() {
  console.log("Tizen Input Fix Enabled");

  // Listen for focus events to automatically try and trigger the IME
  document.addEventListener("focusin", function (e) {
    const el = e.target;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
      console.log("Input focused:", el.name || el.placeholder);
      
      // Some Tizen versions need a click to open the virtual keyboard
      // We do it with a slight delay to ensure the focus transition is complete
      setTimeout(() => {
        if (document.activeElement === el) {
          el.click();
        }
      }, 100);
    }
  });

  document.addEventListener("keydown", function (e) {
    const el = document.activeElement;
    if (!el) return;

    const isInput = el.tagName === "INPUT" || el.tagName === "TEXTAREA";

    // Standard Enter (13), Samsung "Done/OK" (65376, 65385), and other variations
    const isEnter = 
      e.keyCode === 13 || 
      e.keyCode === 65376 || 
      e.keyCode === 65385 || 
      e.keyCode === 29443 || 
      e.key === "Enter";

    if (isInput && isEnter) {
      console.log("Enter pressed on input, forcing click");
      // Prevent default to stop form submission or other browser behaviors
      // but ensure we trigger the click for the IME
      e.preventDefault();
      e.stopPropagation();

      el.focus();
      el.click();
    }
  });
}
