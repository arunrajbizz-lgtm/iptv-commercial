class AVPlayManager {
  constructor() {
    this.player = null;
    this.container = null;
    this.initialized = false;
    this.currentUrl = "";
    this.retryAttempted = false;
  }

  // INIT
  async initialize(containerId) {
    try {
      // TIZEN
      if (window.webapis && window.webapis.avplay) {
        this.player = window.webapis.avplay;
        this.container = document.getElementById(containerId);
        this.initialized = true;
        console.log("AVPlay Ready");
        return true;
      }

      // HTML5 FALLBACK
      this.container = document.getElementById(containerId);
      console.log("Fallback Video Player");
      this.initialized = true;
      return true;
    } catch (error) {
      console.log("AVPlay Init Error", error);
      return false;
    }
  }

  switchProtocol(url) {
    if (url.startsWith("http://")) {
      return url.replace("http://", "https://");
    }
    if (url.startsWith("https://")) {
      return url.replace("https://", "http://");
    }
    return url;
  }

  // PLAY
  async play(url, retry = true) {
    try {
      if (!url) {
        throw new Error("Invalid URL");
      }

      this.currentUrl = url;
      this.retryAttempted = !retry;

      // AVPLAY
      if (this.player) {
        try {
          this.player.stop();
        } catch {
          // Ignore stop errors
        }

        // OPEN
        this.player.open(url);

        // DISPLAY
        // Use container rect for better accuracy, fallback to 1080p
        let rect = { left: 0, top: 0, width: 1920, height: 1080 };
        if (this.container) {
          rect = this.container.getBoundingClientRect();
        }

        this.player.setDisplayRect(
          Math.round(rect.left),
          Math.round(rect.top),
          Math.round(rect.width),
          Math.round(rect.height)
        );

        // Common Tizen properties for better compatibility
        try {
          this.player.setStreamingProperty("ADAPTIVE_INFO", "BITRATES=2000~100000|STARTBITRATE=LOWEST");
        } catch (e) { console.log("Set ADAPTIVE_INFO error", e); }

        try {
          this.player.setDisplayMethod("PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO");
        } catch (e) { console.log("Set DisplayMethod error", e); }

        // BUFFER
        this.player.setBufferingParam(
          "PLAYER_BUFFER_FOR_PLAY",
          "PLAYER_BUFFER_SIZE_IN_SECOND",
          3
        );

        // LISTENER
        this.player.setListener({
          onbufferingstart: () => {
            console.log("Buffering Start");
          },
          onbufferingprogress: (percent) => {
            console.log("Buffer:", percent);
          },
          onbufferingcomplete: () => {
            console.log("Buffer Complete");
          },
          onstreamcompleted: () => {
            console.log("Stream End");
          },
          onerror: (error) => {
            console.log("AVPlay Error", error);
            this.handleError(url);
          }
        });

        // PREPARE
        this.player.prepareAsync(
          () => {
            this.player.play();
            console.log("Playback Started");
          },
          (error) => {
            console.log("Prepare Error", error);
            this.handleError(url);
          }
        );

        return true;
      }

      // HTML5
      this.createHTML5Player(url);
      return true;
    } catch (error) {
      console.log("Play Error", error);
      this.handleError(url);
      return false;
    }
  }

  handleError(url) {
    if (!this.retryAttempted) {
      const retryUrl = this.switchProtocol(url);
      console.log("Retrying with protocol switch:", retryUrl);
      this.play(retryUrl, false);
    }
  }

  // HTML5
  createHTML5Player(url) {
    if (!this.container) return;

    this.container.innerHTML = "";
    const video = document.createElement("video");
    video.src = url;
    video.autoplay = true;
    video.controls = false;
    video.playsInline = true;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";

    this.container.appendChild(video);
    this.html5 = video;

    video.onerror = () => {
      console.log("HTML5 Video Error");
      if (!this.retryAttempted) {
        const retryUrl = this.switchProtocol(url);
        this.retryAttempted = true;
        video.src = retryUrl;
        video.play();
      }
    };
  }

  // PAUSE
  pause() {
    try {
      if (this.player) {
        this.player.pause();
      } else if (this.html5) {
        this.html5.pause();
      }
    } catch (error) {
      console.log(error);
    }
  }

  // RESUME
  resume() {
    try {
      if (this.player) {
        this.player.play();
      } else if (this.html5) {
        this.html5.play();
      }
    } catch (error) {
      console.log(error);
    }
  }

  // STOP
  stop() {
    try {
      if (this.player) {
        this.player.stop();
        this.player.close();
      }
      if (this.html5) {
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
      if (this.player) {
        this.player.seekTo(seconds * 1000);
      } else if (this.html5) {
        this.html5.currentTime = seconds;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // CURRENT TIME
  getCurrentTime() {
    try {
      if (this.player) {
        return Math.floor(this.player.getCurrentTime() / 1000);
      } else if (this.html5) {
        return Math.floor(this.html5.currentTime);
      }
    } catch (error) {
      console.log(error);
    }
    return 0;
  }

  // DURATION
  getDuration() {
    try {
      if (this.player) {
        return Math.floor(this.player.getDuration() / 1000);
      } else if (this.html5) {
        return Math.floor(this.html5.duration);
      }
    } catch (error) {
      console.log(error);
    }
    return 0;
  }
}

const avplayManager = new AVPlayManager();
export default avplayManager;
