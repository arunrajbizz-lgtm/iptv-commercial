import { navigateTo } from "../utils/navigation";
import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

export default function SearchPage() {

  const [query,
    setQuery] =
    useState("");

  const [results,
    setResults] =
    useState([]);

  const [focused,
    setFocused] =
    useState(0);

  // INIT
  useEffect(() => {

    const voice =
      localStorage.getItem(
        "voice_search"
      );

    if (voice) {

      setQuery(voice);

      searchContent(
        voice
      );
    }

  }, []);

  // SEARCH
  function searchContent(
    text
  ) {

    const movies =
      JSON.parse(

        localStorage.getItem(
          "movies"
        )
      ) || [];

    const series =
      JSON.parse(

        localStorage.getItem(
          "series"
        )
      ) || [];

    const live =
      JSON.parse(

        localStorage.getItem(
          "live_channels"
        )
      ) || [];

    const all = [

      ...movies.map(
        item => ({

          ...item,

          type:
            "movie"
        })
      ),

      ...series.map(
        item => ({

          ...item,

          type:
            "series"
        })
      ),

      ...live.map(
        item => ({

          ...item,

          type:
            "live"
        })
      )
    ];

    const filtered =
      all.filter(item => {

        const name =

          (
            item.name
            || ""
          ).toLowerCase();

        return name.includes(
          text.toLowerCase()
        );
      });

    setResults(filtered);

    setFocused(0);
  }

  // REMOTE
  useEffect(() => {

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
            results.length - 1
          ) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        case KEYS.ENTER:

          openItem();

          break;

        case KEYS.BACK:

          navigateTo("/dashboard");

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
    focused,
    results
  ]);

  // OPEN
  function openItem() {

    const item =
      results[focused];

    if (!item) return;

    // SERIES
    if (
      item.type === "series"
    ) {

      localStorage.setItem(

        "selected_series",

        JSON.stringify(item)
      );

      navigateTo("/series-info");

      return;
    }

    // PLAYER
    localStorage.setItem(
      "stream_id",
      item.stream_id
    );

    localStorage.setItem(
      "stream_name",
      item.name
    );

    localStorage.setItem(
      "stream_type",
      item.type
    );

    navigateTo("/player");
  }

  return (

    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "#000",
      color: "white",
      padding: "40px"
    }}>

      {/* TITLE */}

      <div style={{
        fontSize: "56px",
        fontWeight: "bold",
        marginBottom: "30px"
      }}>

        SEARCH

      </div>

      {/* INPUT */}

      <div style={{
        padding: "24px",
        borderRadius: "18px",
        background: "#1d1d1d",
        fontSize: "28px",
        marginBottom: "40px",
        border:
          "2px solid rgba(255,255,255,0.08)"
      }}>

        {query || "Voice Search..."}

      </div>

      {/* RESULTS */}

      <div style={{
        display: "flex",
        flexDirection:
          "column",
        gap: "20px"
      }}>

        {
          results.map(
            (item, index) => (

            <div
              key={index}
              style={{

                display: "flex",

                gap: "24px",

                padding:
                  "20px",

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

              {/* IMAGE */}

              <img
                src={
                  item.stream_icon
                  ||
                  item.cover
                }
                alt=""
                style={{
                  width: "140px",
                  height: "200px",
                  objectFit:
                    "cover",
                  borderRadius:
                    "14px",
                  background:
                    "#000"
                }}
              />

              {/* INFO */}

              <div style={{
                flex: 1
              }}>

                {/* NAME */}

                <div style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  marginBottom:
                    "14px"
                }}>

                  {item.name}

                </div>

                {/* TYPE */}

                <div style={{
                  fontSize: "22px",
                  opacity: 0.8
                }}>

                  {
                    item.type
                      ?.toUpperCase()
                  }

                </div>

              </div>

            </div>

          ))
        }

      </div>

    </div>
  );
}