import { navigateTo } from "../utils/navigation";
import {
  useEffect,
  useState
} from "react";

export default function RecommendedRow() {

  const [items,
    setItems] =
    useState([]);

  // INIT
  useEffect(() => {

    generateRecommendations();

  }, []);

  // AI RECOMMENDATIONS
  function generateRecommendations() {

    try {

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

      // MIX
      const mixed = [

        ...movies.slice(0, 6)
          .map(item => ({

            ...item,

            type:
              "movie"
          })),

        ...series.slice(0, 6)
          .map(item => ({

            ...item,

            type:
              "series"
          })),

        ...live.slice(0, 6)
          .map(item => ({

            ...item,

            type:
              "live"
          }))
      ];

      // SHUFFLE
      const shuffled =
        mixed.sort(
          () => 0.5 - Math.random()
        );

      setItems(
        shuffled.slice(0, 12)
      );

    } catch (error) {

      console.log(error);
    }
  }

  // OPEN
  function openItem(item) {

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

    localStorage.setItem(
      "stream_icon",
      item.stream_icon
      || item.cover
    );

    navigateTo("/player");
  }

  // EMPTY
  if (!items.length) {

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

        AI RECOMMENDED

      </div>

      {/* ROW */}

      <div style={{
        display: "flex",
        gap: "24px",
        overflowX: "auto",
        paddingBottom: "10px"
      }}>

        {
          items.map(
            (item, index) => (

            <div
              key={index}
              onClick={() => {

                openItem(item);
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
                  "2px solid rgba(255,255,255,0.08)",

                transition:
                  "all 0.2s ease"
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
                  width: "100%",
                  height: "340px",
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
                  lineHeight: 1.4,
                  marginBottom:
                    "10px"
                }}>

                  {item.name}

                </div>

                {/* TYPE */}

                <div style={{
                  fontSize: "18px",
                  opacity: 0.75
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