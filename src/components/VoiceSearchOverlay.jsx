import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

export default function VoiceSearchOverlay({

  visible,

  onResult,

  onClose
}) {

  const [listening,
    setListening] =
    useState(false);

  const [text,
    setText] =
    useState("");

  // INIT
  useEffect(() => {

    if (!visible) return;

    startVoice();

  }, [
    visible
  ]);

  // VOICE
  function startVoice() {

    try {

      setListening(true);

      setText(
        "Listening..."
      );

      // WEB SPEECH
      const SpeechRecognition =

        window.SpeechRecognition
        ||
        window.webkitSpeechRecognition;

      // NOT SUPPORTED
      if (
        !SpeechRecognition
      ) {

        setText(
          "Voice not supported"
        );

        return;
      }

      const recognition =
        new SpeechRecognition();

      recognition.lang =
        "en-US";

      recognition.continuous =
        false;

      recognition.interimResults =
        false;

      recognition.start();

      // RESULT
      recognition.onresult =
        event => {

        const transcript =

          event.results[0][0]
            .transcript;

        setText(
          transcript
        );

        setListening(false);

        setTimeout(() => {

          onResult(
            transcript
          );

        }, 1200);
      };

      // ERROR
      recognition.onerror =
        error => {

        console.log(error);

        setListening(false);

        setText(
          "Voice Error"
        );
      };

      // END
      recognition.onend =
        () => {

        setListening(false);
      };

    } catch (error) {

      console.log(error);

      setListening(false);

      setText(
        "Voice Failed"
      );
    }
  }

  // REMOTE
  useEffect(() => {

    if (!visible) return;

    function handleKeys(event) {

      switch (event.keyCode) {

        case KEYS.BACK:

        case KEYS.BLUE:

          onClose();

          break;

        case KEYS.ENTER:

          startVoice();

          break;

        default:

          break;
      }
    }

    document.addEventListener(
      "keydown",
      handleKeys
    );

    return () => {

      document.removeEventListener(
        "keydown",
        handleKeys
      );
    };

  }, [
    visible
  ]);

  // HIDE
  if (!visible) {

    return null;
  }

  return (

    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "rgba(0,0,0,0.82)",
      backdropFilter:
        "blur(18px)",
      display: "flex",
      justifyContent:
        "center",
      alignItems:
        "center",
      zIndex: 999999,
      color: "white"
    }}>

      {/* CARD */}

      <div style={{
        width: "760px",
        background:
          "#111",
        borderRadius:
          "28px",
        padding: "50px",
        textAlign:
          "center",
        border:
          "2px solid rgba(255,255,255,0.08)"
      }}>

        {/* ICON */}

        <div style={{
          width: "160px",
          height: "160px",
          borderRadius:
            "50%",
          margin:
            "0 auto 30px auto",
          display: "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          background:
            listening
              ? "#00aaff"
              : "#222",
          fontSize: "80px",
          animation:
            listening
              ? "pulse 1s infinite"
              : "none"
        }}>

          🎤

        </div>

        {/* TITLE */}

        <div style={{
          fontSize: "44px",
          fontWeight: "bold",
          marginBottom: "24px"
        }}>

          VOICE SEARCH

        </div>

        {/* TEXT */}

        <div style={{
          fontSize: "30px",
          opacity: 0.9,
          lineHeight: 1.6,
          minHeight: "80px"
        }}>

          {text}

        </div>

        {/* HELP */}

        <div style={{
          marginTop: "40px",
          fontSize: "22px",
          opacity: 0.7
        }}>

          ENTER = RETRY  
          BLUE/BACK = CLOSE

        </div>

      </div>

    </div>
  );
}