export const KEYS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  ENTER: 13,
  ENTER_SAMSUNG: 29443,
  OK_SAMSUNG: 65385,
  DONE_SAMSUNG: 65376,
  BACK: 10009,
  EXIT: 10182,
  PLAY: 415,
  PAUSE: 19,
  STOP: 413,
  FF: 417,
  REWIND: 412,
  RED: 403,
  GREEN: 404,
  YELLOW: 405,
  BLUE: 406,
  INFO: 457,
  CH_UP: 427,
  CH_DOWN: 428,
  GUIDE: 458,
  NUM_0: 48,
  NUM_1: 49,
  NUM_2: 50,
  NUM_3: 51,
  NUM_4: 52,
  NUM_5: 53,
  NUM_6: 54,
  NUM_7: 55,
  NUM_8: 56,
  NUM_9: 57
};

export function isEnterKey(keyCode) {
  return (
    keyCode === KEYS.ENTER ||
    keyCode === KEYS.ENTER_SAMSUNG ||
    keyCode === KEYS.OK_SAMSUNG ||
    keyCode === KEYS.DONE_SAMSUNG
  );
}

// REGISTER
export function registerTizenKeys() {

  try {

    if (
      window.tizen
      &&
      window.tizen.tvinputdevice
    ) {

      const keys = [

        "MediaPlay",

        "MediaPause",

        "MediaStop",

        "MediaFastForward",

        "MediaRewind",

        "ColorF0Red",

        "ColorF1Green",

        "ColorF2Yellow",

        "ColorF3Blue",

        "ChannelUp",

        "ChannelDown",

        "Info",

        "Exit",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
      ];

      keys.forEach(key => {

        try {

          window.tizen
            .tvinputdevice
            .registerKey(key);

        } catch {

          console.log(
            "KEY REGISTER ERROR",
            key
          );
        }
      });

      console.log(
        "Samsung TV Keys Registered"
      );
    }

  } catch (error) {

    console.log(
      "Tizen Remote Error",
      error
    );
  }
}
// REGISTER
export function registerRemoteKeys() {
  try {
    if (
      window.tizen &&
      window.tizen.tvinputdevice &&
      window.tizen.tvinputdevice.registerKey
    ) {
      const keys = [
        "MediaPlay",
        "MediaPause",
        "MediaStop",
        "MediaRewind",
        "MediaFastForward",
        "MediaPlayPause",
        "ColorF0Red",
        "ColorF1Green",
        "ColorF2Yellow",
        "ColorF3Blue",
        "ChannelUp",
        "ChannelDown",
        "Guide",
        "Info",
        "Exit",
        "Menu",
        "Search",
        "Caption",
        "Extra",
        "Teletext",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
      ];

      keys.forEach(function (key) {
        try {
          window.tizen.tvinputdevice.registerKey(key);
        } catch {
          // Some TV models do not expose every optional key.
        }
      });
      
      console.log("Samsung TV Remote Keys Registered Successfully");
    }
  } catch (e) {
    console.log("registerRemoteKeys failed", e);
  }

  // Debug Key Logger
  document.addEventListener("keydown", (e) => {
    console.log("Remote Key Pressed:", e.keyCode, "Key Name:", e.key || "unknown");
  });
}
