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

  // INIT
  useEffect(() => {

    focusManager.setZone(
      "content"
    );

    loadCategories();

  }, []);

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

            setZone(
              "categories"
            );

            break;

          case KEYS.UP:

            if (
              focusedMovie > 0
            ) {

              setFocusedMovie(
                prev => prev - 1
              );
            }

            break;

          case KEYS.DOWN:

            if (

              focusedMovie
              <
              movies.length - 1
            ) {

              setFocusedMovie(
                prev => prev + 1
              );
            }

            break;

          case KEYS.ENTER:

            openMovie();

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

    window.location.href =
      "/player";
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

          MOVIES

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

          MOVIES

        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill,minmax(220px,1fr))",
          gap: "24px"
        }}>

          {
            movies.map(
              (movie, index) => (

              <div
                key={
                  movie.stream_id
                }
                style={{

                  background:
                    zone ===
                    "movies"
                    &&
                    focusedMovie
                    === index
                      ? "#00aaff"
                      : "#1d1d1d",

                  border:
                    zone ===
                    "movies"
                    &&
                    focusedMovie
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
                    movie.stream_icon
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

                    {movie.name}

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