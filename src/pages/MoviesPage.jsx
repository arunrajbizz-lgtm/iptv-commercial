import { navigateTo } from "../utils/navigation";
import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import {
  getMovieCategories,
  getMovies
} from "../services/xtreamApi";

import focusManager
from "../core/FocusManager";

export default function MoviesPage() {

  const [categories,
    setCategories] =
    useState([]);

  const [movies,
    setMovies] =
    useState([]);

  const [focusedCategory,
    setFocusedCategory] =
    useState(0);

  const [focusedMovie,
    setFocusedMovie] =
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
    if (zone === "movies") {
      scrollFocused("movie", focusedMovie);
    }
  }, [focusedMovie, zone, movies]);

  function scrollFocused(type, index) {
    const el = document.querySelector(`[data-${type}-index="${index}"]`);
    if (!el) return;
    el.scrollIntoView({
      block: "nearest",
      behavior: "smooth"
    });
  }

  // LOAD CATEGORIES
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
        await getMovieCategories(

          iptv.host,

          iptv.username,

          iptv.password
        );

      setCategories(data || []);

      // AUTO LOAD
      if (
        data?.length
      ) {

        loadMovies(
          data[0]
            .category_id
        );
      }

    } catch (error) {

      console.log(error);
    }
  }

  // LOAD MOVIES
  async function loadMovies(
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
        await getMovies(

          iptv.host,

          iptv.username,

          iptv.password,

          categoryId
        );

      setMovies(data || []);

      setFocusedMovie(0);

    } catch (error) {

      console.log(error);
    }
  }

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      // CATEGORIES
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

              loadMovies(

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

              loadMovies(

                categories[next]
                  ?.category_id
              );
            }

            break;

          case KEYS.RIGHT:

            setZone(
              "movies"
            );

            break;

          default:

            break;
        }
      }

      // MOVIES
      else {

        switch (event.keyCode) {

          case KEYS.LEFT:
            if (focusedMovie % COLS === 0) {
              setZone("categories");
            } else {
              setFocusedMovie(prev => prev - 1);
            }
            break;

          case KEYS.RIGHT:
            if (focusedMovie % COLS < COLS - 1 && focusedMovie < movies.length - 1) {
              setFocusedMovie(prev => prev + 1);
            }
            break;

          case KEYS.UP:
            if (focusedMovie >= COLS) {
              setFocusedMovie(prev => prev - COLS);
            }
            break;

          case KEYS.DOWN:
            if (focusedMovie + COLS < movies.length) {
              setFocusedMovie(prev => prev + COLS);
            } else if (focusedMovie < movies.length - 1) {
               // Jump to last one if in last row
               setFocusedMovie(movies.length - 1);
            }
            break;

          case KEYS.ENTER:

            openMovie();

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

    focusedMovie,

    categories,

    movies
  ]);

  // OPEN
  function openMovie() {

    const movie =
      movies[focusedMovie];

    if (!movie) return;

    localStorage.setItem(
      "stream_id",
      movie.stream_id
    );

    localStorage.setItem(
      "stream_name",
      movie.name
    );

    localStorage.setItem(
      "stream_type",
      "movie"
    );

    localStorage.setItem(
      "stream_icon",
      movie.stream_icon
    );

    navigateTo("/player");
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
          MOVIES
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
            {categories[focusedCategory]?.category_name || "All Movies"}
          </h2>
          <div className="section-subtitle">
            {movies.length} TITLES
          </div>
        </div>

        <div className="content-grid" style={{
           gridTemplateColumns: `repeat(${COLS}, 1fr)`,
           gap: "35px"
        }}>

          {
            movies.map(
              (movie, index) => (

              <div
                key={
                  movie.stream_id
                }
                data-movie-index={index}
                className={`content-card ${zone === "movies" && focusedMovie === index ? "active" : ""}`}
              >

                <img
                  src={
                    movie.stream_icon
                  }
                  alt=""
                  className="content-poster"
                  style={{ height: "400px" }}
                />

                <div className="content-title">
                    {movie.name}
                </div>

              </div>

            ))
          }

        </div>

        {!movies.length && <div className="loader" style={{ background: "transparent", height: "400px" }}>No Movies Found</div>}

      </main>

    </div>
  );
}