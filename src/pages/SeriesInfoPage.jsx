import { navigateTo } from "../utils/navigation";
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

  useEffect(() => {
    const el = document.querySelector(`[data-episode-index="${focusedEpisode}"]`);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [focusedEpisode]);

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

          navigateTo("/series");

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

    navigateTo("/player");
  }

  // EMPTY
  if (!series) {

    return null;
  }

  return (

    <div className="page-container scale-in" style={{ padding: 0, background: "#050505" }}>

      {/* HERO */}

      <div style={{
        position: "relative",
        height: "70vh",
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
            opacity: 0.3
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
            "linear-gradient(to top, #050505 10%, rgba(5,5,5,0.8) 30%, transparent 100%)"
        }} />

        {/* CONTENT */}

        <div style={{
          position: "absolute",
          left: "60px",
          bottom: "60px",
          maxWidth: "900px"
        }}>

          {/* TITLE */}

          <h1 style={{
            fontSize: "80px",
            fontWeight: "900",
            marginBottom: "20px",
            lineHeight: 1.1,
            textShadow: "0 4px 20px rgba(0,0,0,0.8)"
          }}>
            {series.name}
          </h1>

          {/* DESC */}

          <p style={{
            fontSize: "24px",
            lineHeight: 1.6,
            opacity: 0.7,
            marginBottom: "40px"
          }}>
            {series.plot || "No description available for this series."}
          </p>
          
          <div style={{ display: "flex", gap: "20px" }}>
              <button className="player-button active" onClick={() => openEpisode()}>WATCH S1:E{focusedEpisode+1}</button>
          </div>

        </div>

      </div>

      {/* EPISODES */}

      <div style={{
        padding: "60px",
        background: "#050505"
      }}>

        <h2 className="section-title" style={{ marginBottom: "40px" }}>
          Episodes
        </h2>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>

          {
            episodes.map(
              (episode, index) => (

              <div
                key={episode.id}
                data-episode-index={index}
                className={`content-card ${focusedEpisode === index ? "active" : ""}`}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  padding: "20px",
                  alignItems: "center",
                  gap: "30px",
                  background: focusedEpisode === index ? "linear-gradient(90deg, #00aaff, #0077aa)" : "rgba(255,255,255,0.05)",
                  border: focusedEpisode === index ? "3px solid white" : "3px solid transparent"
                }}
              >

                <div style={{
                   fontSize: "40px",
                   fontWeight: "900",
                   opacity: 0.3,
                   width: "80px",
                   textAlign: "center"
                }}>
                   {index + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "26px",
                    fontWeight: "bold",
                    marginBottom: "8px"
                  }}>
                    {episode.title}
                  </div>
                  <div style={{ fontSize: "18px", opacity: 0.6 }}>
                    {episode.plot}
                  </div>
                </div>
                
                {focusedEpisode === index && (
                   <div style={{ fontSize: "30px" }}>▶</div>
                )}

              </div>

            ))
          }

        </div>

      </div>

    </div>
  );
}