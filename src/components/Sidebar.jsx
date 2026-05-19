import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import focusManager
from "../core/FocusManager";

export default function Sidebar({
  active,
  onSelect
}) {

  const items = [

    "LIVE TV",

    "MOVIES",

    "FAVORITES",

    "SERIES",

    "SETTINGS"
  ];

  const [focused,
    setFocused] =
    useState(0);

  // RESTORE
  useEffect(() => {

    const saved =
      focusManager.getSidebar();

    setFocused(saved);

  }, []);

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      // ONLY SIDEBAR ACTIVE
      if (
        focusManager.getZone()
        !== "sidebar"
      ) return;

      switch (event.keyCode) {

        // UP
        case KEYS.UP:

          if (focused > 0) {

            const newIndex =
              focused - 1;

            setFocused(
              newIndex
            );

            focusManager.setSidebar(
              newIndex
            );

            onSelect(
              newIndex
            );
          }

          break;

        // DOWN
        case KEYS.DOWN:

          if (
            focused <
            items.length - 1
          ) {

            const newIndex =
              focused + 1;

            setFocused(
              newIndex
            );

            focusManager.setSidebar(
              newIndex
            );

            onSelect(
              newIndex
            );
          }

          break;

        // RIGHT
        case KEYS.RIGHT:

          // SIDEBAR → CATEGORY
          focusManager.setZone(
            "categories"
          );

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
    onSelect
  ]);

  return (

    <div style={{
      width: "260px",
      height: "100vh",
      background: "#111",
      color: "white",
      paddingTop: "30px",
      boxSizing: "border-box",
      borderRight:
        "2px solid #222"
    }}>

      <h1 style={{
        textAlign: "center",
        marginBottom: "40px",
        fontSize: "40px"
      }}>
        IPTV
      </h1>

      {
        items.map(
          (item, index) => (

          <div
            key={item}
            style={{

              padding: "22px",

              fontSize: "24px",

              background:
                focused === index
                  &&
                focusManager.getZone()
                  === "sidebar"
                    ? "#00aaff"
                    : "transparent",

              borderLeft:
                focused === index
                  &&
                focusManager.getZone()
                  === "sidebar"
                    ? "6px solid white"
                    : "6px solid transparent",

              transition:
                "all 0.2s ease"
            }}
          >

            {item}

          </div>

        ))
      }

    </div>
  );
}