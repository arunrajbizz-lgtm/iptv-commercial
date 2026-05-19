import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import {
  verifyPin
} from "../utils/ParentalControl";

import focusManager
from "../core/FocusManager";

export default function PinDialog({
  visible,
  onSuccess,
  onClose
}) {

  const keypad = [

    "1", "2", "3",

    "4", "5", "6",

    "7", "8", "9",

    "CLEAR", "0", "OK"
  ];

  const [focused,
    setFocused] =
    useState(0);

  const [pin,
    setPin] =
    useState("");

  const [error,
    setError] =
    useState("");

  // OPEN
  useEffect(() => {

    if (visible) {

      focusManager.setZone(
        "modal"
      );

      setFocused(0);

      setPin("");

      setError("");
    }

  }, [visible]);

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      if (!visible) return;

      if (
        focusManager.getZone()
        !== "modal"
      ) return;

      switch (event.keyCode) {

        // LEFT
        case KEYS.LEFT:

          if (focused % 3 !== 0) {

            setFocused(
              prev => prev - 1
            );
          }

          break;

        // RIGHT
        case KEYS.RIGHT:

          if (focused % 3 !== 2) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        // UP
        case KEYS.UP:

          if (focused >= 3) {

            setFocused(
              prev => prev - 3
            );
          }

          break;

        // DOWN
        case KEYS.DOWN:

          if (focused + 3 < keypad.length) {

            setFocused(
              prev => prev + 3
            );
          }

          break;

        // ENTER
        case KEYS.ENTER:

          handlePress(
            keypad[focused]
          );

          break;

        // BACK
        case KEYS.BACK:

          closeDialog();

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
    visible,
    focused,
    pin
  ]);

  // PRESS
  function handlePress(value) {

    setError("");

    // CLEAR
    if (
      value === "CLEAR"
    ) {

      setPin("");

      return;
    }

    // OK
    if (
      value === "OK"
    ) {

      submitPin();

      return;
    }

    // LIMIT
    if (
      pin.length >= 4
    ) return;

    setPin(prev =>

      prev + value
    );
  }

  // VERIFY
  function submitPin() {

    if (
      verifyPin(pin)
    ) {

      focusManager.setZone(
        "content"
      );

      if (onSuccess) {

        onSuccess();
      }

    } else {

      setError(
        "Invalid PIN"
      );

      setPin("");
    }
  }

  // CLOSE
  function closeDialog() {

    focusManager.setZone(
      "content"
    );

    if (onClose) {

      onClose();
    }
  }

  // HIDE
  if (!visible) return null;

  return (

    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "rgba(0,0,0,0.86)",
      display: "flex",
      justifyContent:
        "center",
      alignItems:
        "center",
      zIndex: 999999,
      backdropFilter:
        "blur(12px)"
    }}>

      {/* CARD */}

      <div style={{
        width: "700px",
        background:
          "linear-gradient(to bottom, #1e1e1e, #101010)",
        borderRadius: "26px",
        padding: "40px",
        border:
          "2px solid rgba(255,255,255,0.08)",
        color: "white"
      }}>

        {/* TITLE */}

        <div style={{
          fontSize: "42px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#00aaff"
        }}>

          PARENTAL LOCK

        </div>

        {/* TEXT */}

        <div style={{
          fontSize: "22px",
          opacity: 0.8,
          marginBottom: "35px"
        }}>

          Enter PIN to access
          restricted content

        </div>

        {/* PIN */}

        <div style={{
          display: "flex",
          gap: "18px",
          justifyContent:
            "center",
          marginBottom: "30px"
        }}>

          {
            [0,1,2,3].map(index => (

              <div
                key={index}
                style={{

                  width: "70px",

                  height: "70px",

                  borderRadius: "16px",

                  background:
                    pin[index]
                      ? "#00aaff"
                      : "#222",

                  border:
                    "3px solid rgba(255,255,255,0.1)",

                  display: "flex",

                  justifyContent:
                    "center",

                  alignItems:
                    "center",

                  fontSize: "42px",

                  fontWeight:
                    "bold"
                }}
              >

                {
                  pin[index]
                    ? "•"
                    : ""
                }

              </div>

            ))
          }

        </div>

        {/* ERROR */}

        {
          error && (

            <div style={{
              textAlign: "center",
              color: "#ff4444",
              fontSize: "22px",
              marginBottom: "25px",
              fontWeight: "bold"
            }}>

              {error}

            </div>

          )
        }

        {/* KEYPAD */}

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "18px"
        }}>

          {
            keypad.map(
              (item, index) => (

              <div
                key={item}
                style={{

                  height: "90px",

                  borderRadius:
                    "18px",

                  background:
                    focused === index
                      ? "#00aaff"
                      : "#222",

                  border:
                    focused === index
                      ? "3px solid white"
                      : "3px solid transparent",

                  display: "flex",

                  justifyContent:
                    "center",

                  alignItems:
                    "center",

                  fontSize: "28px",

                  fontWeight:
                    "bold",

                  transition:
                    "all 0.2s ease",

                  transform:
                    focused === index
                      ? "scale(1.05)"
                      : "scale(1)",

                  boxShadow:
                    focused === index
                      ? "0 0 24px rgba(0,170,255,0.8)"
                      : "none"
                }}
              >

                {item}

              </div>

            ))
          }

        </div>

      </div>

    </div>
  );
}