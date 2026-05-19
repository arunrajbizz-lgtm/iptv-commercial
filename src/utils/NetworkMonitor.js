let reconnectTimer = null;

// ONLINE
export function isOnline() {

  return navigator.onLine;
}

// START MONITOR
export function startNetworkMonitor({

  onOnline,

  onOffline,

  onReconnect

} = {}) {

  // ONLINE
  function handleOnline() {

    console.log(
      "Network Online"
    );

    if (onOnline) {

      onOnline();
    }

    // TRY RECONNECT
    if (onReconnect) {

      onReconnect();
    }
  }

  // OFFLINE
  function handleOffline() {

    console.log(
      "Network Offline"
    );

    if (onOffline) {

      onOffline();
    }

    // AUTO RETRY
    startReconnectLoop(
      onReconnect
    );
  }

  window.addEventListener(
    "online",
    handleOnline
  );

  window.addEventListener(
    "offline",
    handleOffline
  );

  return () => {

    window.removeEventListener(
      "online",
      handleOnline
    );

    window.removeEventListener(
      "offline",
      handleOffline
    );

    stopReconnectLoop();
  };
}

// RECONNECT LOOP
export function startReconnectLoop(
  callback
) {

  stopReconnectLoop();

  reconnectTimer =
    setInterval(() => {

      if (
        navigator.onLine
      ) {

        console.log(
          "Reconnected"
        );

        stopReconnectLoop();

        if (callback) {

          callback();
        }
      }

    }, 5000);
}

// STOP LOOP
export function stopReconnectLoop() {

  if (reconnectTimer) {

    clearInterval(
      reconnectTimer
    );

    reconnectTimer = null;
  }
}

// STREAM RECOVERY
export async function retryStream(
  video,
  url,
  retries = 3
) {

  for (
    let i = 0;
    i < retries;
    i++
  ) {

    try {

      console.log(
        `Retry Stream ${i + 1}`
      );

      video.src = url;

      video.load();

      await video.play();

      return true;

    } catch (error) {

      console.log(
        "Retry Failed",
        error
      );

      await wait(2000);
    }
  }

  return false;
}

// WAIT
function wait(ms) {

  return new Promise(resolve => {

    setTimeout(
      resolve,
      ms
    );
  });
}