import { navigateTo } from "../utils/navigation";
import {
  useEffect,
  useState
} from "react";

export default function RecentChannels() {

  const [channels,
    setChannels] =
    useState([]);

  // INIT
  useEffect(() => {

    loadRecent();

  }, []);

  // LOAD
  function loadRecent() {

    try {

      const data =
        JSON.parse(

          localStorage.getItem(
            "recent_channels"
          )
        ) || [];

      setChannels(data);

    } catch (error) {

      console.log(error);
    }
  }

  // OPEN
  function openChannel(
    channel
  ) {

    if (!channel) return;

    localStorage.setItem(
      "stream_id",
      channel.stream_id
    );

    localStorage.setItem(
      "stream_name",
      channel.name
    );

    localStorage.setItem(
      "stream_type",
      "live"
    );

    navigateTo("/player");
  }

  // EMPTY
  if (!channels.length) {

    return null;
  }

  return (

    <div style={{
      marginBottom: "60px"
    }}>

      {/* TITLE */}

      <div style={{
        fontSize: "42px",
        fontWeight: "bold",
        marginBottom: "26px"
      }}>

        RECENT CHANNELS

      </div>

      {/* ROW */}

      <div style={{
        display: "flex",
        gap: "24px",
        overflowX: "auto"
      }}>

        {
          channels.map(
            (channel, index) => (

            <div
              key={index}
              onClick={() => {

                openChannel(
                  channel
                );
              }}
              style={{

                minWidth:
                  "240px",

                background:
                  "#1d1d1d",

                borderRadius:
                  "18px",

                overflow:
                  "hidden",

                cursor:
                  "pointer",

                border:
                  "2px solid rgba(255,255,255,0.08)"
              }}
            >

              {/* IMAGE */}

              <img
                src={
                  channel.stream_icon
                }
                alt=""
                style={{
                  width: "100%",
                  height: "240px",
                  objectFit:
                    "cover",
                  background:
                    "#000"
                }}
              />

              {/* INFO */}

              <div style={{
                padding: "18px"
              }}>

                {/* NAME */}

                <div style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  marginBottom:
                    "10px"
                }}>

                  {
                    channel.name
                  }

                </div>

                {/* LABEL */}

                <div style={{
                  fontSize: "18px",
                  opacity: 0.72
                }}>

                  Recently Watched

                </div>

              </div>

            </div>

          ))
        }

      </div>

    </div>
  );
}