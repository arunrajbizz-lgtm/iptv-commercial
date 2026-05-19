import React from "react";

export default class ErrorBoundary
extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

      hasError: false,

      error: null
    };
  }

  // ERROR
  static getDerivedStateFromError(
    error
  ) {

    return {

      hasError: true,

      error
    };
  }

  // CATCH
  componentDidCatch(
    error,
    errorInfo
  ) {

    console.log(
      "App Error:",
      error
    );

    console.log(
      errorInfo
    );
  }

  // RELOAD
  reloadApp() {

    window.location.reload();
  }

  render() {

    // ERROR UI
    if (
      this.state.hasError
    ) {

      return (

        <div style={{
          width: "100%",
          height: "100vh",
          background: "#000",
          color: "white",
          display: "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          padding: "40px"
        }}>

          {/* CARD */}

          <div style={{
            width: "900px",
            background:
              "#111",
            borderRadius:
              "24px",
            padding: "50px",
            textAlign:
              "center",
            border:
              "2px solid rgba(255,255,255,0.08)"
          }}>

            {/* TITLE */}

            <div style={{
              fontSize: "62px",
              fontWeight: "bold",
              color: "#ff4444",
              marginBottom: "30px"
            }}>

              APPLICATION ERROR

            </div>

            {/* MESSAGE */}

            <div style={{
              fontSize: "24px",
              opacity: 0.8,
              lineHeight: 1.8,
              marginBottom: "40px"
            }}>

              Something went wrong while running the IPTV application.

            </div>

            {/* ERROR */}

            <div style={{
              background: "#1d1d1d",
              padding: "24px",
              borderRadius: "18px",
              marginBottom: "40px",
              textAlign: "left",
              fontSize: "18px",
              overflow: "auto"
            }}>

              {
                this.state.error
                  ?.toString()
              }

            </div>

            {/* BUTTON */}

            <button
              onClick={() => {

                this.reloadApp();
              }}
              style={{

                padding:
                  "22px 40px",

                border:
                  "none",

                borderRadius:
                  "18px",

                background:
                  "#00aaff",

                color:
                  "white",

                fontSize:
                  "26px",

                fontWeight:
                  "bold",

                cursor:
                  "pointer"
              }}
            >

              RESTART APPLICATION

            </button>

          </div>

        </div>
      );
    }

    // NORMAL
    return this.props.children;
  }
}