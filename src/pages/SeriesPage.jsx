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
    <div className="dashboard-page scale-in" style={{ display: "flex", width: "100%", height: "100vh" }}>
      <aside className="sidebar glass-panel">
        <div className="sidebar-logo">
          SERIES
        </div>

        <div className="category-list" style={{ flex: 1, overflowY: "auto" }}>
          {
            categories.map(
              (item, index) => (

              <div
                key={
                  item.category_id
                }
                data-category-index={index}
                className={`sidebar-item ${zone === "categories" && focusedCategory === index ? "active" : ""}`}
              >
                {item.category_name}
              </div>

            ))
          }
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: "auto", padding: "80px", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)" }}>
        <header style={{ marginBottom: "60px" }}>
          <h1 className="section-title">
            {categories[focusedCategory]?.category_name || "Latest Series"}
          </h1>
          <p className="section-subtitle">
            {series.length} SHOWS AVAILABLE IN HDR
          </p>
        </header>

        <div className="content-grid" style={{ 
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: "40px" 
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
                  src={item.cover}
                  alt=""
                  className="content-poster"
                  style={{ height: "450px" }}
                />
                <div className="content-title">
                    {item.name}
                </div>
              </div>

            ))
          }
        </div>

        {!series.length && (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
            <div className="loader" />
          </div>
        )}
      </main>
    </div>
  );
}