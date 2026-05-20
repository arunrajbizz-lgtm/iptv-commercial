export const KEYS = {

  LEFT: 37,

  UP: 38,

  RIGHT: 39,

  DOWN: 40,

  ENTER: 13,

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

  INFO: 457
};

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

        "Exit"
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
        "ColorF0Red",
        "ColorF1Green",
        "ColorF2Yellow",
        "ColorF3Blue",
        "ChannelUp",
        "ChannelDown",
        "Guide",
        "Info",
        "Exit"
      ];

      keys.forEach(function (key) {
        try {
          window.tizen.tvinputdevice.registerKey(key);
        } catch {
          // Some TV models do not expose every optional key.
        }
      });
    }
  } catch (e) {
    console.log("registerRemoteKeys failed", e);
  }
}
