import { navigateTo } from "../utils/navigation";
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

  const COLS = 5;

  // INIT
  useEffect(() => {

    focusManager.setZone(
      "content"
    );

    loadCategories();

  }, []);

  useEffect(() => {
    if (zone === "categories") {
      scrollFocused("category", focusedCategory);
    }
  }, [focusedCategory, zone]);

  useEffect(() => {
    if (zone === "series") {
      scrollFocused("series", focusedSeries);
    }
  }, [focusedSeries, zone, series]);

  function scrollFocused(type, index) {
    const el = document.querySelector(`[data-${type}-index="${index}"]`);
    if (!el) return;
    el.scrollIntoView({
      block: "nearest",
      behavior: "smooth"
    });
  }

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
            if (focusedSeries % COLS === 0) {
              setZone("categories");
            } else {
              setFocusedSeries(prev => prev - 1);
            }
            break;

          case KEYS.RIGHT:
            if (focusedSeries % COLS < COLS - 1 && focusedSeries < series.length - 1) {
              setFocusedSeries(prev => prev + 1);
            }
            break;

          case KEYS.UP:
            if (focusedSeries >= COLS) {
              setFocusedSeries(prev => prev - COLS);
            }
            break;

          case KEYS.DOWN:
            if (focusedSeries + COLS < series.length) {
              setFocusedSeries(prev => prev + COLS);
            } else if (focusedSeries < series.length - 1) {
               setFocusedSeries(series.length - 1);
            }
            break;

          case KEYS.ENTER:

            openSeries();

            break;

          case KEYS.BACK:
            setZone("categories");
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

    navigateTo("/series-info");
  }

  return (

    <div className="page-container scale-in" style={{ padding: 0, display: "flex", background: "#050505" }}>

      {/* LEFT - CATEGORIES */}

      <aside style={{
        width: "360px",
        height: "100vh",
        background: "rgba(10,10,10,0.8)",
        backdropFilter: "blur(20px)",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.05)"
      }}>

        <h1 className="sidebar-logo" style={{ textAlign: "left", paddingLeft: "20px" }}>
          SERIES
        </h1>

        <div className="category-list" style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          {
            categories.map(
              (item, index) => (

              <div
                key={
                  item.category_id
                }
                data-category-index={index}
                className={`sidebar-item ${zone === "categories" && focusedCategory === index ? "active" : ""}`}
                style={{
                   cursor: "pointer",
                   opacity: zone === "categories" && focusedCategory === index ? 1 : 0.6
                }}
              >
                {item.category_name}
              </div>

            ))
          }
        </div>

      </aside>

      {/* RIGHT - GRID */}

      <main style={{
        flex: 1,
        height: "100vh",
        overflowY: "auto",
        padding: "60px 40px"
      }}>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "50px"
        }}>
          <h2 className="section-title">
            {categories[focusedCategory]?.category_name || "All Series"}
          </h2>
          <div className="section-subtitle">
            {series.length} TITLES
          </div>
        </div>

        <div className="content-grid" style={{
           gridTemplateColumns: `repeat(${COLS}, 1fr)`,
           gap: "35px"
        }}>

          {
            series.map(
              (item, index) => (

              <div
                key={
                  item.series_id
                }
                data-series-index={index}
                className={`content-card ${zone === "series" && focusedSeries === index ? "active" : ""}`}
              >

                <img
                  src={
                    item.cover
                  }
                  alt=""
                  className="content-poster"
                  style={{ height: "400px" }}
                />

                <div className="content-title">
                    {item.name}
                </div>

              </div>

            ))
          }

        </div>

        {!series.length && <div className="loader" style={{ background: "transparent", height: "400px" }}>No Series Found</div>}

      </main>

    </div>
  );
}