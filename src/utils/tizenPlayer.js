export function isTizenTV() {
  return !!(window.webapis && window.webapis.avplay);
}

export function playWithTizenAVPlay(url, containerId = "avplay-container") {
  if (!isTizenTV()) return false;

  try {
    const box = document.getElementById(containerId);
    if (!box) return false;

    const rect = box.getBoundingClientRect();

    try {
      window.webapis.avplay.stop();
    } catch {}

    try {
      window.webapis.avplay.close();
    } catch {}

    window.webapis.avplay.open(url);

    window.webapis.avplay.setDisplayRect(
      Math.round(rect.left),
      Math.round(rect.top),
      Math.round(rect.width),
      Math.round(rect.height)
    );

    window.webapis.avplay.prepareAsync(
      function () {
        window.webapis.avplay.play();
      },
      function (err) {
        console.log("AVPlay prepare error", err);
      }
    );

    return true;
  } catch (e) {
    console.log("AVPlay error", e);
    return false;
  }
}

export function stopTizenAVPlay() {
  try {
    if (!isTizenTV()) return;

    try {
      window.webapis.avplay.stop();
    } catch {}

    try {
      window.webapis.avplay.close();
    } catch {}
  } catch (e) {
    console.log("AVPlay stop error", e);
  }
}