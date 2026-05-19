class AVPlayManager {

  constructor() {

    this.player = null;

    this.container = null;

    this.initialized = false;
  }

  // INIT
  async initialize(
    containerId
  ) {

    try {

      // TIZEN
      if (
        window.webapis
        &&
        window.webapis.avplay
      ) {

        this.player =
          window.webapis.avplay;

        this.container =
          document.getElementById(
            containerId
          );

        this.initialized =
          true;

        console.log(
          "AVPlay Ready"
        );

        return true;
      }

      // HTML5 FALLBACK
      console.log(
        "Fallback Video Player"
      );

      this.initialized =
        true;

      return true;

    } catch (error) {

      console.log(
        "AVPlay Init Error",
        error
      );

      return false;
    }
  }

  // PLAY
  async play(url) {

    try {

      if (!url) {

        throw new Error(
          "Invalid URL"
        );
      }

      // AVPLAY
      if (
        this.player
      ) {

        try {

          this.player.stop();

        } catch (e) {}

        // OPEN
        this.player.open(url);

        // DISPLAY
        this.player.setDisplayRect(

          0,
          0,

          1920,
          1080
        );

        // BUFFER
        this.player.setBufferingParam(

          "PLAYER_BUFFER_FOR_PLAY",

          "PLAYER_BUFFER_SIZE_IN_SECOND",

          3
        );

        // LISTENER
        this.player.setListener({

          onbufferingstart: () => {

            console.log(
              "Buffering Start"
            );
          },

          onbufferingprogress:
            percent => {

            console.log(
              "Buffer:",
              percent
            );
          },

          onbufferingcomplete:
            () => {

            console.log(
              "Buffer Complete"
            );
          },

          onstreamcompleted:
            () => {

            console.log(
              "Stream End"
            );
          },

          onerror:
            error => {

            console.log(
              "AVPlay Error",
              error
            );
          }
        });

        // PREPARE
        this.player.prepareAsync(

          () => {

            this.player.play();

            console.log(
              "Playback Started"
            );
          },

          error => {

            console.log(
              "Prepare Error",
              error
            );
          }
        );

        return true;
      }

      // HTML5
      this.createHTML5Player(
        url
      );

      return true;

    } catch (error) {

      console.log(
        "Play Error",
        error
      );

      return false;
    }
  }

  // HTML5
  createHTML5Player(
    url
  ) {

    if (
      !this.container
    ) return;

    this.container.innerHTML =
      "";

    const video =
      document.createElement(
        "video"
      );

    video.src = url;

    video.autoplay =
      true;

    video.controls =
      false;

    video.playsInline =
      true;

    video.style.width =
      "100%";

    video.style.height =
      "100%";

    video.style.objectFit =
      "cover";

    this.container.appendChild(
      video
    );

    this.html5 =
      video;
  }

  // PAUSE
  pause() {

    try {

      if (
        this.player
      ) {

        this.player.pause();
      }

      else if (
        this.html5
      ) {

        this.html5.pause();
      }

    } catch (error) {

      console.log(error);
    }
  }

  // RESUME
  resume() {

    try {

      if (
        this.player
      ) {

        this.player.play();
      }

      else if (
        this.html5
      ) {

        this.html5.play();
      }

    } catch (error) {

      console.log(error);
    }
  }

  // STOP
  stop() {

    try {

      if (
        this.player
      ) {

        this.player.stop();

        this.player.close();
      }

      if (
        this.html5
      ) {

        this.html5.pause();

        this.html5.src = "";

        this.html5.load();
      }

    } catch (error) {

      console.log(error);
    }
  }

  // SEEK
  seek(seconds) {

    try {

      if (
        this.player
      ) {

        this.player.seekTo(
          seconds * 1000
        );
      }

      else if (
        this.html5
      ) {

        this.html5.currentTime =
          seconds;
      }

    } catch (error) {

      console.log(error);
    }
  }

  // CURRENT TIME
  getCurrentTime() {

    try {

      if (
        this.player
      ) {

        return Math.floor(

          this.player
            .getCurrentTime()
          / 1000
        );
      }

      else if (
        this.html5
      ) {

        return Math.floor(
          this.html5.currentTime
        );
      }

    } catch (error) {

      console.log(error);
    }

    return 0;
  }

  // DURATION
  getDuration() {

    try {

      if (
        this.player
      ) {

        return Math.floor(

          this.player
            .getDuration()
          / 1000
        );
      }

      else if (
        this.html5
      ) {

        return Math.floor(
          this.html5.duration
        );
      }

    } catch (error) {

      console.log(error);
    }

    return 0;
  }
}

const avplayManager =
  new AVPlayManager();

export default avplayManager;