import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import focusManager
from "../core/FocusManager";

export default function SearchModal({
  visible,
  items,
  onClose,
  onSelect
}) {

  const [query,
    setQuery] =
    useState("");

  const [focused,
    setFocused] =
    useState(0);

  const [results,
    setResults] =
    useState([]);

  // FILTER
  useEffect(() => {

    if (!visible) return;

    const filtered =
      items.filter(item => {

        const name =
          item.name || "";

        return name
          .toLowerCase()
          .includes(
            query.toLowerCase()
          );

      });

    setResults(filtered);

  }, [
    query,
    items,
    visible
  ]);

  // OPEN MODAL
  useEffect(() => {

    if (!visible) return;

    focusManager.setZone(
      "modal"
    );

    setFocused(0);

  }, [visible]);

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      // ONLY MODAL ACTIVE
      if (
        focusManager.getZone()
        !== "modal"
      ) return;

      switch (event.keyCode) {

        // BACK
        case KEYS.BACK:

          closeModal();

          break;

        // UP
        case KEYS.UP:

          if (focused > 0) {

            setFocused(
              prev => prev - 1
            );
          }

          break;

        // DOWN
        case KEYS.DOWN:

          if (
            focused <
            results.length - 1
          ) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        // ENTER
        case KEYS.ENTER:

          if (
            results[focused]
          ) {

            onSelect(
              results[focused]
            );
          }

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
    results,
    visible
  ]);

  // CLOSE
  function closeModal() {

    focusManager.setZone(
      "content"
    );

    onClose();
  }

  // HIDE
  if (!visible) return null;

  return (

    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "rgba(0,0,0,0.95)",
      zIndex: 9999,
      padding: "40px",
      boxSizing: "border-box",
      color: "white"
    }}>

      {/* HEADER */}

      <div style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        marginBottom: "30px"
      }}>

        <div style={{
          fontSize: "42px",
          fontWeight: "bold"
        }}>
          SEARCH
        </div>

        <div style={{
          fontSize: "22px",
          color: "#00aaff"
        }}>
          BACK = CLOSE
        </div>

      </div>

      {/* INPUT */}

      <input
        autoFocus
        value={query}
        onChange={(e) =>
          setQuery(
            e.target.value
          )
        }
        placeholder="Search channels, movies, series..."
        style={{
          width: "100%",
          padding: "20px",
          fontSize: "28px",
          borderRadius: "14px",
          border: "none",
          outline: "none",
          marginBottom: "30px",
          background: "#222",
          color: "white",
          boxSizing: "border-box"
        }}
      />

      {/* RESULTS */}

      <div style={{
        display: "flex",
        flexDirection:
          "column",
        gap: "15px",
        maxHeight: "70vh",
        overflowY: "auto"
      }}>

        {
          results.length === 0 && (

            <div style={{
              fontSize: "24px",
              opacity: 0.7
            }}>

              No Results Found

            </div>

          )
        }

        {
          results.map(
            (item, index) => (

            <div
              key={
                item.stream_id
                || index
              }
              style={{

                background:
                  focused === index
                    ? "#00aaff"
                    : "#222",

                border:
                  focused === index
                    ? "3px solid white"
                    : "3px solid transparent",

                borderRadius:
                  "12px",

                padding: "20px",

                display: "flex",

                alignItems:
                  "center",

                gap: "20px",

                transition:
                  "all 0.2s ease"
              }}
            >

              {/* ICON */}

              {
                item.stream_icon && (

                  <img
                    src={
                      item.stream_icon
                    }
                    alt=""
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit:
                        "contain",
                      borderRadius:
                        "8px",
                      background:
                        "#000"
                    }}
                  />

                )
              }

              {/* TITLE */}

              <div>

                <div style={{
                  fontSize: "26px",
                  fontWeight:
                    "bold"
                }}>

                  {item.name}

                </div>

                <div style={{
                  fontSize: "18px",
                  opacity: 0.7,
                  marginTop: "5px"
                }}>

                  Press ENTER to play

                </div>

              </div>

            </div>

          ))
        }

      </div>

    </div>
  );
}