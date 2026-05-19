import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import {
  toggleFavorite,
  isFavorite
} from "../utils/FavoritesManager";

import Toast
from "./Toast";

export default function FavoriteButton({
  item
}) {

  const [favorite,
    setFavorite] =
    useState(false);

  const [showToast,
    setShowToast] =
    useState(false);

  const [toastMessage,
    setToastMessage] =
    useState("");

  // LOAD
  useEffect(() => {

    if (
      item?.stream_id
    ) {

      setFavorite(

        isFavorite(
          item.stream_id
        )
      );
    }

  }, [item]);

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      // YELLOW BUTTON
      if (
        event.keyCode
        ===
        KEYS.YELLOW
      ) {

        handleToggle();
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
    favorite,
    item
  ]);

  // TOGGLE
  function handleToggle() {

    if (!item) return;

    const added =
      toggleFavorite(item);

    setFavorite(added);

    if (added) {

      setToastMessage(
        "Added to Favorites"
      );

    } else {

      setToastMessage(
        "Removed from Favorites"
      );
    }

    setShowToast(true);
  }

  return (

    <>

      {/* BUTTON */}

      <div
        onClick={handleToggle}
        style={{

          width: "70px",

          height: "70px",

          borderRadius: "50%",

          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",

          background:
            favorite
              ? "#ffaa00"
              : "rgba(255,255,255,0.12)",

          border:
            favorite
              ? "3px solid white"
              : "2px solid rgba(255,255,255,0.15)",

          fontSize: "34px",

          transition:
            "all 0.2s ease",

          boxShadow:
            favorite
              ? "0 0 20px rgba(255,170,0,0.8)"
              : "none"
        }}
      >

        ★

      </div>

      {/* TOAST */}

      <Toast
        visible={showToast}
        message={toastMessage}
        type="success"
        onClose={() => {

          setShowToast(false);
        }}
      />

    </>
  );
}