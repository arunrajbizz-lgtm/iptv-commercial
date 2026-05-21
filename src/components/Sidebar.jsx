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
    <div className="sidebar glass-panel">
      <div className="sidebar-logo">
        STREAM<span>DECK</span>
      </div>

      {
        items.map(
          (item, index) => (

          <div
            key={item}
            className={`sidebar-item ${focused === index && focusManager.getZone() === "sidebar" ? "active" : ""}`}
            style={{
               opacity: (focused === index && focusManager.getZone() === "sidebar") || active === item ? 1 : 0.5
            }}
          >
            {item}
          </div>

        ))
      }

    </div>
  );
}
