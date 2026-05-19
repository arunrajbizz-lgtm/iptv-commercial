import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import focusManager
from "../core/FocusManager";

export default function SeriesInfoPage() {

  const [series,
    setSeries] =
    useState(null);

  const [episodes,
    setEpisodes] =
    useState([]);

  const [focusedEpisode,
    setFocusedEpisode] =
    useState(0);

  // INIT
  useEffect(() => {

    focusManager.setZone(
      "content"
    );

    loadSeries();

  }, []);

  // LOAD
  function loadSeries() {

    try {

      const item =
        JSON.parse(

          localStorage.getItem(
            "selected_series"
          )
        );

      if (!item) return;

      setSeries(item);

      // DUMMY EPISODES
      const demoEpisodes = [];

      for (
        let i = 1;
        i <= 20;
        i++
      ) {

        demoEpisodes.push({

          id: i,

          title:
            `Episode ${i}`,

          plot:
            "Episode description.",

          stream_id:
            item.series_id,

          container_extension:
            "mp4"
        });
      }

      setEpisodes(
        demoEpisodes
      );

    } catch (error) {

      console.log(error);
    }
  }

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      switch (event.keyCode) {

        case KEYS.UP:

          if (
            focusedEpisode > 0
          ) {

            setFocusedEpisode(
              prev => prev - 1
            );
          }

          break;

        case KEYS.DOWN:

          if (

            focusedEpisode
            <
            episodes.length - 1
          ) {

            setFocusedEpisode(
              prev => prev + 1
            );
          }

          break;

        case KEYS.ENTER:

          openEpisode();

          break;

        case KEYS.BACK:

          window.location.href =
            "/series";

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
    focusedEpisode,
    episodes
  ]);

  // OPEN
  function openEpisode() {

    const episode =
      episodes[focusedEpisode];

    if (!episode) return;

    localStorage.setItem(
      "stream_id",
      episode.stream_id
    );

    localStorage.setItem(
      "stream_name",
      `${series.name} - ${episode.title}`
    );

    localStorage.setItem(
      "stream_type",
      "series"
    );

    window.location.href =
      "/player";
  }

  // EMPTY
  if (!series) {

    return null;
  }

  return (

    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "#000",
      color: "white"
    }}>

      {/* HERO */}

      <div style={{
        position: "relative",
        height: "650px",
        overflow: "hidden"
      }}>

        {/* BG */}

        <img
          src={
            series.cover
          }
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit:
              "cover",
            opacity: 0.4
          }}
        />

        {/* OVERLAY */}

        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(to top, #000 5%, transparent 60%)"
        }} />

        {/* CONTENT */}

        <div style={{
          position: "absolute",
          left: "70px",
          bottom: "70px",
          width: "700px"
        }}>

          {/* TITLE */}

          <div style={{
            fontSize: "68px",
            fontWeight: "bold",
            marginBottom: "20px"
          }}>

            {series.name}

          </div>

          {/* DESC */}

          <div style={{
            fontSize: "24px",
            lineHeight: 1.6,
            opacity: 0.85
          }}>

            {
              series.plot
              ||
              "Series description unavailable."
            }

          </div>

        </div>

      </div>

      {/* EPISODES */}

      <div style={{
        padding: "40px"
      }}>

        {/* TITLE */}

        <div style={{
          fontSize: "42px",
          fontWeight: "bold",
          marginBottom: "30px"
        }}>

          EPISODES

        </div>

        {/* LIST */}

        <div style={{
          display: "flex",
          flexDirection:
            "column",
          gap: "18px"
        }}>

          {
            episodes.map(
              (episode, index) => (

              <div
                key={episode.id}
                style={{

                  display: "flex",

                  gap: "24px",

                  padding:
                    "24px",

                  borderRadius:
                    "18px",

                  background:
                    focusedEpisode
                    === index
                      ? "#00aaff"
                      : "#1d1d1d",

                  border:
                    focusedEpisode
                    === index
                      ? "3px solid white"
                      : "2px solid rgba(255,255,255,0.08)"
                }}
              >

                {/* THUMB */}

                <img
                  src={
                    series.cover
                  }
                  alt=""
                  style={{
                    width: "240px",
                    height: "140px",
                    objectFit:
                      "cover",
                    borderRadius:
                      "14px"
                  }}
                />

                {/* INFO */}

                <div style={{
                  flex: 1
                }}>

                  <div style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    marginBottom:
                      "14px"
                  }}>

                    {
                      episode.title
                    }

                  </div>

                  <div style={{
                    fontSize: "20px",
                    opacity: 0.8,
                    lineHeight: 1.6
                  }}>

                    {
                      episode.plot
                    }

                  </div>

                </div>

              </div>

            ))
          }

        </div>

      </div>

    </div>
  );
}