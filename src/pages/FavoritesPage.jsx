import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

export default function FavoritesPage() {

  const [favorites,
    setFavorites] =
    useState([]);

  const [focused,
    setFocused] =
    useState(0);

  // INIT
  useEffect(() => {

    loadFavorites();

  }, []);

  // LOAD
  function loadFavorites() {

    try {

      const data =
        JSON.parse(

          localStorage.getItem(
            "favorites"
          )
        ) || [];

      setFavorites(data);

    } catch (error) {

      console.log(error);
    }
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
            favorites.length - 1
          ) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        case KEYS.ENTER:

          openFavorite();

          break;

        case KEYS.RED:

          removeFavorite();

          break;

        case KEYS.BACK:

          window.location.href =
            "/dashboard";

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
    favorites
  ]);

  // OPEN
  function openFavorite() {

    const item =
      favorites[focused];

    if (!item) return;

    // SERIES
    if (
      item.type === "series"
    ) {

      localStorage.setItem(

        "selected_series",

        JSON.stringify(item)
      );

      window.location.href =
        "/series-info";

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

    window.location.href =
      "/player";
  }

  // REMOVE
  function removeFavorite() {

    const updated =
      favorites.filter(

        (_, index) =>

          index !== focused
      );

    localStorage.setItem(

      "favorites",

      JSON.stringify(updated)
    );

    setFavorites(updated);

    if (
      focused >= updated.length
    ) {

      setFocused(
        Math.max(
          0,
          updated.length - 1
        )
      );
    }
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
        marginBottom: "16px"
      }}>

        FAVORITES

      </div>

      {/* HELP */}

      <div style={{
        fontSize: "22px",
        opacity: 0.75,
        marginBottom: "40px"
      }}>

        RED BUTTON = REMOVE FAVORITE

      </div>

      {/* EMPTY */}

      {
        favorites.length === 0 && (

          <div style={{
            fontSize: "28px",
            opacity: 0.7
          }}>

            No favorites added.

          </div>

        )
      }

      {/* LIST */}

      <div style={{
        display: "flex",
        flexDirection:
          "column",
        gap: "20px"
      }}>

        {
          favorites.map(
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

                <div style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  marginBottom:
                    "14px"
                }}>

                  {item.name}

                </div>

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