import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import {
  getEPG
} from "../services/xtreamApi";

export default function EPGOverlay({

  visible,

  channel,

  onClose
}) {

  const [programs,
    setPrograms] =
    useState([]);

  const [focused,
    setFocused] =
    useState(0);

  const [loading,
    setLoading] =
    useState(false);

  // LOAD
  useEffect(() => {

    if (
      visible
      &&
      channel
    ) {

      loadEPG();
    }

  }, [
    visible,
    channel
  ]);

  // API
  async function loadEPG() {

    try {

      setLoading(true);

      const iptv =
        JSON.parse(

          localStorage.getItem(
            "iptv"
          )
        );

      const data =
        await getEPG(

          iptv.host,

          iptv.username,

          iptv.password,

          channel.stream_id
        );

      // EPG
      const epg =
        data.epg_listings
        || [];

      setPrograms(epg);

      setLoading(false);

    } catch (error) {

      console.log(error);

      setLoading(false);
    }
  }

  // FORMAT
  function formatTime(
    date
  ) {

    try {

      return new Date(
        date
      ).toLocaleTimeString(
        [],
        {
          hour:
            "2-digit",
          minute:
            "2-digit"
        }
      );

    } catch {

      return "--:--";
    }
  }

  // REMOTE
  useEffect(() => {

    if (!visible) return;

    function handleKeys(event) {

      switch (event.keyCode) {

        case KEYS.UP:

          if (focused > 0) {

            setFocused(
              prev => prev - 1
            );
          }

          break;

        case KEYS.DOWN:

          if (
            focused
            <
            programs.length - 1
          ) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        case KEYS.BACK:

        case KEYS.GUIDE:

          onClose();

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
    programs
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
        "rgba(0,0,0,0.92)",
      backdropFilter:
        "blur(18px)",
      zIndex: 999999,
      color: "white",
      padding: "40px",
      overflowY: "auto"
    }}>

      {/* TITLE */}

      <div style={{
        fontSize: "54px",
        fontWeight: "bold",
        marginBottom: "16px",
        color: "#00aaff"
      }}>

        PROGRAM GUIDE

      </div>

      {/* CHANNEL */}

      <div style={{
        fontSize: "28px",
        marginBottom: "40px",
        opacity: 0.82
      }}>

        {
          channel?.name
        }

      </div>

      {/* LOADING */}

      {
        loading && (

          <div className="flex-center">

            <div className="loader" />

          </div>

        )
      }

      {/* EMPTY */}

      {
        !loading
        &&
        programs.length === 0
        &&
        (

          <div style={{
            fontSize: "28px",
            opacity: 0.7
          }}>

            No EPG Data Available

          </div>

        )
      }

      {/* LIST */}

      <div style={{
        display: "flex",
        flexDirection:
          "column",
        gap: "18px"
      }}>

        {
          programs.map(
            (item, index) => (

            <div
              key={index}
              style={{

                padding:
                  "24px",

                borderRadius:
                  "18px",

                background:
                  focused === index
                    ? "#00aaff"
                    : "#1d1d1d",

                border:
                  focused === index
                    ? "3px solid white"
                    : "2px solid rgba(255,255,255,0.08)"
              }}
            >

              {/* TIME */}

              <div style={{
                fontSize: "22px",
                opacity: 0.75,
                marginBottom:
                  "12px"
              }}>

                {
                  formatTime(
                    item.start
                  )
                }

                {" - "}

                {
                  formatTime(
                    item.end
                  )
                }

              </div>

              {/* TITLE */}

              <div style={{
                fontSize: "30px",
                fontWeight: "bold",
                marginBottom:
                  "14px"
              }}>

                {
                  item.title
                  || "Unknown Program"
                }

              </div>

              {/* DESC */}

              <div style={{
                fontSize: "22px",
                lineHeight: 1.6,
                opacity: 0.82
              }}>

                {
                  item.description
                  || "No Description"
                }

              </div>

            </div>

          ))
        }

      </div>

    </div>
  );
}