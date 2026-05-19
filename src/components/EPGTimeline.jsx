import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import {
  getCurrentProgram,
  getNextProgram,
  getProgramProgress,
  buildTimeline
} from "../utils/EPGTimelineManager";

import focusManager
from "../core/FocusManager";

export default function EPGTimeline({
  visible,
  epgData,
  onClose
}) {

  const [timeline,
    setTimeline] =
    useState([]);

  const [current,
    setCurrent] =
    useState(null);

  const [next,
    setNext] =
    useState(null);

  const [progress,
    setProgress] =
    useState(0);

  // LOAD
  useEffect(() => {

    const data =
      buildTimeline(
        epgData || []
      );

    setTimeline(data);

    const currentProgram =
      getCurrentProgram(
        data
      );

    const nextProgram =
      getNextProgram(
        data
      );

    setCurrent(
      currentProgram
    );

    setNext(
      nextProgram
    );

    if (currentProgram) {

      setProgress(
        getProgramProgress(
          currentProgram
        )
      );
    }

  }, [epgData]);

  // AUTO UPDATE
  useEffect(() => {

    const timer =
      setInterval(() => {

        if (current) {

          setProgress(
            getProgramProgress(
              current
            )
          );
        }

      }, 30000);

    return () => {

      clearInterval(
        timer
      );
    };

  }, [current]);

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      if (!visible) return;

      if (
        focusManager.getZone()
        !== "overlay"
      ) return;

      switch (event.keyCode) {

        case KEYS.BACK:

          closeGuide();

          break;

        case KEYS.INFO:

          closeGuide();

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

  }, [visible]);

  // CLOSE
  function closeGuide() {

    focusManager.setZone(
      "player"
    );

    if (onClose) {

      onClose();
    }
  }

  // HIDE
  if (!visible) return null;

  return (

    <div style={{
      position: "absolute",
      bottom: "120px",
      left: "50%",
      transform:
        "translateX(-50%)",
      width: "1400px",
      background:
        "rgba(0,0,0,0.94)",
      borderRadius: "24px",
      padding: "35px",
      color: "white",
      zIndex: 99999,
      backdropFilter:
        "blur(20px)",
      border:
        "2px solid rgba(255,255,255,0.08)",
      boxShadow:
        "0 0 40px rgba(0,0,0,0.6)"
    }}>

      {/* HEADER */}

      <div style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems:
          "center",
        marginBottom: "30px"
      }}>

        <div style={{
          fontSize: "42px",
          fontWeight: "bold",
          color: "#00aaff"
        }}>

          LIVE TV GUIDE

        </div>

        <div style={{
          fontSize: "20px",
          opacity: 0.7
        }}>

          INFO = CLOSE

        </div>

      </div>

      {/* CURRENT */}

      {
        current && (

          <div style={{
            marginBottom: "35px"
          }}>

            <div style={{
              fontSize: "20px",
              opacity: 0.7,
              marginBottom: "12px"
            }}>

              NOW PLAYING

            </div>

            <div style={{
              fontSize: "34px",
              fontWeight: "bold",
              marginBottom: "10px"
            }}>

              {
                current.title
                ||
                current.name
              }

            </div>

            {/* TIME */}

            <div style={{
              display: "flex",
              gap: "20px",
              fontSize: "20px",
              opacity: 0.8,
              marginBottom: "20px"
            }}>

              <div>

                {
                  current.formattedStart
                }

              </div>

              <div>
                →
              </div>

              <div>

                {
                  current.formattedEnd
                }

              </div>

            </div>

            {/* PROGRESS */}

            <div style={{
              width: "100%",
              height: "14px",
              background:
                "rgba(255,255,255,0.15)",
              borderRadius:
                "20px",
              overflow:
                "hidden"
            }}>

              <div style={{
                width:
                  `${progress}%`,
                height: "100%",
                background:
                  "linear-gradient(to right, #00aaff, #00ddff)"
              }} />

            </div>

          </div>

        )
      }

      {/* NEXT */}

      {
        next && (

          <div style={{
            marginBottom: "35px"
          }}>

            <div style={{
              fontSize: "20px",
              opacity: 0.7,
              marginBottom: "12px"
            }}>

              NEXT PROGRAM

            </div>

            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "10px"
            }}>

              {
                next.title
                ||
                next.name
              }

            </div>

            <div style={{
              display: "flex",
              gap: "20px",
              fontSize: "18px",
              opacity: 0.8
            }}>

              <div>

                {
                  next.formattedStart
                }

              </div>

              <div>
                →
              </div>

              <div>

                {
                  next.formattedEnd
                }

              </div>

            </div>

          </div>

        )
      }

      {/* TIMELINE */}

      <div style={{
        display: "flex",
        flexDirection:
          "column",
        gap: "14px",
        maxHeight: "400px",
        overflowY: "auto"
      }}>

        {
          timeline.map(
            (program, index) => {

            const isCurrent =
              current &&
              (
                current.title
                === program.title
              );

            return (

              <div
                key={index}
                style={{

                  padding:
                    "20px",

                  borderRadius:
                    "16px",

                  background:
                    isCurrent
                      ? "#00aaff"
                      : "#1d1d1d",

                  border:
                    isCurrent
                      ? "3px solid white"
                      : "2px solid rgba(255,255,255,0.06)",

                  transition:
                    "all 0.2s ease"
                }}
              >

                <div style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom: "10px"
                }}>

                  {/* TITLE */}

                  <div style={{
                    fontSize: "24px",
                    fontWeight:
                      "bold"
                  }}>

                    {
                      program.title
                      ||
                      program.name
                    }

                  </div>

                  {/* TIME */}

                  <div style={{
                    fontSize: "18px",
                    opacity: 0.8
                  }}>

                    {
                      program.formattedStart
                    }

                    {" - "}

                    {
                      program.formattedEnd
                    }

                  </div>

                </div>

                {/* DESCRIPTION */}

                <div style={{
                  fontSize: "18px",
                  opacity: 0.78,
                  lineHeight: 1.5
                }}>

                  {
                    program.description
                    ||
                    "No description available"
                  }

                </div>

              </div>
            );
          })
        }

      </div>

    </div>
  );
}