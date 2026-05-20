export function isTizenTV() {
  return !!(window.webapis && window.webapis.avplay);
}

export function playWithTizenAVPlay(url, videoBoxId = "avplay-container") {
  if (!isTizenTV()) return false;

  try {
    const box = document.getElementById(videoBoxId);
    const rect = box.getBoundingClientRect();

    window.webapis.avplay.close();
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