import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import {
  getSeriesCategories,
  getSeries
} from "../services/xtreamApi";

import focusManager
from "../core/FocusManager";

export default function SeriesPage() {

  const [categories,
    setCategories] =
    useState([]);

  const [series,
    setSeries] =
    useState([]);

  const [focusedCategory,
    setFocusedCategory] =
    useState(0);

  const [focusedSeries,
    setFocusedSeries] =
    useState(0);

  const [zone,
    setZone] =
    useState("categories");

  // INIT
  useEffect(() => {

    focusManager.setZone(
      "content"
    );

    loadCategories();

  }, []);

  // LOAD
  async function loadCategories() {

    try {

      const iptv =
        JSON.parse(

          localStorage.getItem(
            "iptv"
          )
        );

      if (!iptv) return;

      const data =
        await getSeriesCategories(

          iptv.host,

          iptv.username,

          iptv.password
        );

      setCategories(data || []);

      // FIRST
      if (
        data?.length
      ) {

        loadSeries(
          data[0]
            .category_id
        );
      }

    } catch (error) {

      console.log(error);
    }
  }

  // LOAD SERIES
  async function loadSeries(
    categoryId
  ) {

    try {

      const iptv =
        JSON.parse(

          localStorage.getItem(
            "iptv"
          )
        );

      const data =
        await getSeries(

          iptv.host,

          iptv.username,

          iptv.password,

          categoryId
        );

      setSeries(data || []);

      setFocusedSeries(0);

    } catch (error) {

      console.log(error);
    }
  }

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      // CATEGORY
      if (
        zone === "categories"
      ) {

        switch (event.keyCode) {

          case KEYS.UP:

            if (
              focusedCategory > 0
            ) {

              const next =
                focusedCategory - 1;

              setFocusedCategory(
                next
              );

              loadSeries(

                categories[next]
                  ?.category_id
              );
            }

            break;

          case KEYS.DOWN:

            if (

              focusedCategory
              <
              categories.length - 1
            ) {

              const next =
                focusedCategory + 1;

              setFocusedCategory(
                next
              );

              loadSeries(

                categories[next]
                  ?.category_id
              );
            }

            break;

          case KEYS.RIGHT:

            setZone(
              "series"
            );

            break;

          default:

            break;
        }
      }

      // SERIES
      else {

        switch (event.keyCode) {

          case KEYS.LEFT:

            setZone(
              "categories"
            );

            break;

          case KEYS.UP:

            if (
              focusedSeries > 0
            ) {

              setFocusedSeries(
                prev => prev - 1
              );
            }

            break;

          case KEYS.DOWN:

            if (

              focusedSeries
              <
              series.length - 1
            ) {

              setFocusedSeries(
                prev => prev + 1
              );
            }

            break;

          case KEYS.ENTER:

            openSeries();

            break;

          default:

            break;
        }
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

    zone,

    focusedCategory,

    focusedSeries,

    categories,

    series
  ]);

  // OPEN
  function openSeries() {

    const item =
      series[focusedSeries];

    if (!item) return;

    localStorage.setItem(

      "selected_series",

      JSON.stringify(item)
    );

    window.location.href =
      "/series-info";
  }

  return (

    <div style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      background: "#000",
      color: "white"
    }}>

      {/* LEFT */}

      <div style={{
        width: "320px",
        background: "#111",
        padding: "20px",
        overflowY: "auto"
      }}>

        <div style={{
          fontSize: "42px",
          fontWeight: "bold",
          color: "#00aaff",
          marginBottom: "30px"
        }}>

          SERIES

        </div>

        {
          categories.map(
            (item, index) => (

            <div
              key={
                item.category_id
              }
              style={{

                padding: "20px",

                marginBottom: "14px",

                borderRadius: "16px",

                background:
                  zone ===
                  "categories"
                  &&
                  focusedCategory
                  === index
                    ? "#00aaff"
                    : "#1d1d1d",

                border:
                  zone ===
                  "categories"
                  &&
                  focusedCategory
                  === index
                    ? "3px solid white"
                    : "3px solid transparent",

                fontSize: "24px",

                fontWeight: "bold"
              }}
            >

              {
                item.category_name
              }

            </div>

          ))
        }

      </div>

      {/* RIGHT */}

      <div style={{
        flex: 1,
        padding: "30px",
        overflowY: "auto"
      }}>

        <div style={{
          fontSize: "42px",
          fontWeight: "bold",
          marginBottom: "30px"
        }}>

          SERIES

        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(220px,1fr))",
          gap: "24px"
        }}>

          {
            series.map(
              (item, index) => (

              <div
                key={
                  item.series_id
                }
                style={{

                  background:
                    zone ===
                    "series"
                    &&
                    focusedSeries
                    === index
                      ? "#00aaff"
                      : "#1d1d1d",

                  border:
                    zone ===
                    "series"
                    &&
                    focusedSeries
                    === index
                      ? "3px solid white"
                      : "2px solid rgba(255,255,255,0.08)",

                  borderRadius:
                    "18px",

                  overflow:
                    "hidden"
                }}
              >

                <img
                  src={
                    item.cover
                  }
                  alt=""
                  style={{
                    width: "100%",
                    height: "320px",
                    objectFit:
                      "cover",
                    background:
                      "#000"
                  }}
                />

                <div style={{
                  padding: "16px"
                }}>

                  <div style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    lineHeight: 1.4
                  }}>

                    {item.name}

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