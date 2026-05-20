export function isTizenTV() {
  return !!(window.webapis && window.webapis.avplay);
}

function switchProtocol(url) {
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }

  if (url.startsWith("https://")) {
    return url.replace("https://", "http://");
  }

  return url;
}

export function playWithTizenAVPlay(url, containerId = "avplay-container", retry = true) {
  if (!isTizenTV()) {
    return false;
  }

  try {
    const box = document.getElementById(containerId);
    if (!box) {
      console.log("AVPlay container not found:", containerId);
      return false;
    }

    const rect = box.getBoundingClientRect();

    try {
      window.webapis.avplay.stop();
    } catch {}

    try {
      window.webapis.avplay.close();
    } catch {}

    console.log("AVPlay opening:", url);

    window.webapis.avplay.open(url);

    try {
      window.webapis.avplay.setDisplayMethod(
        "PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO"
      );
    } catch {}

    try {
      window.webapis.avplay.setStreamingProperty(
        "ADAPTIVE_INFO",
        "BITRATES=2000~100000|STARTBITRATE=LOWEST"
      );
    } catch {}

    window.webapis.avplay.setDisplayRect(
      Math.round(rect.left),
      Math.round(rect.top),
      Math.round(rect.width),
      Math.round(rect.height)
    );

    window.webapis.avplay.prepareAsync(
      function () {
        console.log("AVPlay prepared");
        window.webapis.avplay.play();
      },
      function (error) {
        console.log("AVPlay prepare error", error);

        if (retry) {
          const retryUrl = switchProtocol(url);
          console.log("AVPlay retry:", retryUrl);
          playWithTizenAVPlay(retryUrl, containerId, false);
        }
      }
    );

    return true;
  } catch (error) {
    console.log("AVPlay error", error);

    if (retry) {
      const retryUrl = switchProtocol(url);
      playWithTizenAVPlay(retryUrl, containerId, false);
    }

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
  } catch (error) {
    console.log("AVPlay stop error", error);
  }
}