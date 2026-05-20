export function enableTizenInputFix() {
  console.log("Tizen Input Fix Enabled");

  // Track the last focused element to avoid redundant clicks
  let lastFocused = null;

  document.addEventListener("focusin", function (e) {
    const el = e.target;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
      if (lastFocused === el) return;
      lastFocused = el;

      console.log("Input focused:", el.name || el.placeholder || el.id);
      
      // Attempt to trigger the Virtual Keyboard (IME)
      // Different Tizen versions respond to different patterns
      setTimeout(() => {
        if (document.activeElement === el) {
          // 1. Force a click
          el.click();
          
          // 2. Try to set cursor position to end, which often forces IME
          try {
            const val = el.value;
            el.setSelectionRange(val.length, val.length);
          } catch (err) {
            // ignore if not supported
          }

          // 3. For very stubborn TVs, a quick blur/focus might help, 
          // but we do it only once to avoid loops
          if (!el.dataset.imeAttempted) {
            el.dataset.imeAttempted = "true";
            // No, blur/focus often causes more issues on TV. 
            // Stick to click + selection for now.
          }
        }
      }, 250); // Slightly longer delay for system to settle
    } else {
      lastFocused = null;
    }
  });

  document.addEventListener("keydown", function (e) {
    const el = document.activeElement;
    if (!el) return;

    const isInput = el.tagName === "INPUT" || el.tagName === "TEXTAREA";

    // Samsung Remote "Enter/OK" Variations
    const isEnter = 
      e.keyCode === 13 ||      // Standard
      e.keyCode === 65376 ||   // Samsung Done
      e.keyCode === 65385 ||   // Samsung OK
      e.keyCode === 29443 ||   // Samsung Enter
      e.key === "Enter";

    if (isInput && isEnter) {
      console.log("Enter key on input, triggering click for IME");
      // Don't preventDefault here as it might block the keyboard from closing or submitting
      // but ensure we click to trigger IME if it's not already open
      el.click();
    }
  });
}
