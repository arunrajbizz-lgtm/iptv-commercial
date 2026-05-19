import {
  useEffect,
  useState
} from "react";

export default function Toast({
  message,
  visible,
  type = "info",
  onClose
}) {

  const [show,
    setShow] =
    useState(false);

  // SHOW
  useEffect(() => {

    if (visible) {

      setShow(true);

      const timer =
        setTimeout(() => {

          setShow(false);

          if (onClose) {

            onClose();
          }

        }, 3000);

      return () => {

        clearTimeout(
          timer
        );
      };
    }

  }, [
    visible,
    onClose
  ]);

  // HIDE
  if (!show) return null;

  // COLORS
  function getColor() {

    switch (type) {

      case "success":

        return "#00cc66";

      case "error":

        return "#ff4444";

      case "warning":

        return "#ffaa00";

      default:

        return "#00aaff";
    }
  }

  // ICON
  function getIcon() {

    switch (type) {

      case "success":

        return "✓";

      case "error":

        return "✕";

      case "warning":

        return "⚠";

      default:

        return "ℹ";
    }
  }

  return (

    <div style={{
      position: "fixed",
      top: "40px",
      right: "40px",
      zIndex: 999999,
      animation:
        "toastSlide 0.25s ease"
    }}>

      <div style={{

        minWidth: "420px",

        display: "flex",

        alignItems:
          "center",

        gap: "20px",

        padding:
          "22px 28px",

        borderRadius:
          "18px",

        background:
          "rgba(20,20,20,0.96)",

        backdropFilter:
          "blur(20px)",

        border:
          `3px solid ${getColor()}`,

        boxShadow:
          `0 0 24px ${getColor()}55`,

        color: "white"
      }}>

        {/* ICON */}

        <div style={{

          width: "52px",

          height: "52px",

          borderRadius: "50%",

          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",

          fontSize: "28px",

          fontWeight:
            "bold",

          background:
            getColor(),

          color: "white"
        }}>

          {getIcon()}

        </div>

        {/* TEXT */}

        <div>

          <div style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "5px"
          }}>

            IPTV Notification

          </div>

          <div style={{
            fontSize: "20px",
            opacity: 0.85
          }}>

            {message}

          </div>

        </div>

      </div>

      {/* ANIMATION */}

      <style>{`

        @keyframes toastSlide {

          from {

            opacity: 0;

            transform:
              translateX(80px);
          }

          to {

            opacity: 1;

            transform:
              translateX(0);
          }
        }
      `}</style>

    </div>
  );
}