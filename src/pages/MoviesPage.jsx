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
    <div className="dashboard-page scale-in" style={{ display: "flex", width: "100%", height: "100vh" }}>
      <aside className="sidebar glass-panel">
        <div className="sidebar-logo">
          MOVIES
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
            {categories[focusedCategory]?.category_name || "Latest Movies"}
          </h1>
          <p className="section-subtitle">
            {movies.length} TITLES AVAILABLE IN 4K
          </p>
        </header>

        <div className="content-grid" style={{ 
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: "40px" 
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
                  src={movie.stream_icon}
                  alt=""
                  className="content-poster"
                  style={{ height: "450px" }}
                />
                <div className="content-title">
                    {movie.name}
                </div>
              </div>

            ))
          }
        </div>

        {!movies.length && (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
            <div className="loader" />
          </div>
        )}
      </main>
    </div>
  );
}