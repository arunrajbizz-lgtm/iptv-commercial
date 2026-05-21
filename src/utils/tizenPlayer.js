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
    } catch { /* ignore */ }

    try {
      window.webapis.avplay.close();
    } catch { /* ignore */ }

    console.log("AVPlay opening:", url);

    window.webapis.avplay.open(url);

    try {
      window.webapis.avplay.setDisplayMethod("PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO");
    } catch { /* ignore */ }

    try {
      window.webapis.avplay.setStreamingProperty("ADAPTIVE_INFO", "BITRATES=2000~100000|STARTBITRATE=LOWEST");
    } catch { /* ignore */ }

    window.webapis.avplay.setDisplayRect(
      Math.round(rect.left),
      Math.round(rect.top),
      Math.round(rect.width),
      Math.round(rect.height)
    );

    window.webapis.avplay.prepareAsync(
      function () {
        console.log("AVPlay prepared");
        
        // --- AUDIO TRACK SELECTION ---
        try {
          const totalTracks = window.webapis.avplay.getTotalTrackInfo();
          for (let i = 0; i < totalTracks.length; i++) {
            if (totalTracks[i].type === "AUDIO") {
              window.webapis.avplay.selectTrack("AUDIO", i);
              break;
            }
          }
        } catch (e) {
          console.log("Audio Track Selection Error", e);
        }

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
    } catch { /* ignore */ }

    try {
      window.webapis.avplay.close();
    } catch { /* ignore */ }
  } catch (error) {
    console.log("AVPlay stop error", error);
  }
}
