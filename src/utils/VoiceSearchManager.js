class VoiceSearchManager {

  constructor() {

    this.supported = false;

    this.recognition = null;
  }

  // INIT
  initialize() {

    try {

      // WEBKIT
      const SpeechRecognition =

        window.SpeechRecognition
        ||
        window.webkitSpeechRecognition;

      if (SpeechRecognition) {

        this.recognition =
          new SpeechRecognition();

        this.recognition.lang =
          "en-US";

        this.recognition.continuous =
          false;

        this.recognition.interimResults =
          false;

        this.supported = true;

        console.log(
          "Voice Search Ready"
        );

        return true;
      }

    } catch (error) {

      console.log(
        "Voice Init Error",
        error
      );
    }

    return false;
  }

  // START
  start(onResult, onError) {

    try {

      if (
        !this.supported
      ) {

        this.initialize();
      }

      if (
        !this.recognition
      ) {

        throw new Error(
          "Voice Unsupported"
        );
      }

      // RESULT
      this.recognition.onresult =
        event => {

        const text =
          event.results[0][0]
            .transcript;

        console.log(
          "Voice Result:",
          text
        );

        if (onResult) {

          onResult(text);
        }
      };

      // ERROR
      this.recognition.onerror =
        error => {

        console.log(
          "Voice Error",
          error
        );

        if (onError) {

          onError(error);
        }
      };

      this.recognition.start();

    } catch (error) {

      console.log(error);

      if (onError) {

        onError(error);
      }
    }
  }

  // STOP
  stop() {

    try {

      if (
        this.recognition
      ) {

        this.recognition.stop();
      }

    } catch (error) {

      console.log(error);
    }
  }
}

const voiceSearch =
  new VoiceSearchManager();

export default voiceSearch;