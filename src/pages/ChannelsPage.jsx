import { navigateTo } from "../utils/navigation";
import {
  useEffect,
  useState
} from "react";

import {
  getLiveStreams
} from "../services/xtreamApi";

import {
  KEYS
} from "../utils/tizenRemote";

import SearchModal
from "../components/SearchModal";

import {
  addFavorite,
  removeFavorite,
  isFavorite
} from "../utils/favorites";

import focusManager
from "../core/FocusManager";

import navigationManager
from "../core/NavigationManager";

export default function ChannelsPage() {

  const [channels, setChannels] =
    useState([]);

  const [focused, setFocused] =
    useState(0);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  // RESTORE FOCUS
  useEffect(() => {

    const saved =
      focusManager.getChannel();

    setFocused(saved);

    focusManager.setZone(
      "content"
    );

  }, []);

  // LOAD CHANNELS
  useEffect(() => {

    async function loadChannels() {

      try {

        const saved =
          JSON.parse(
            localStorage.getItem(
              "iptv"
            )
          );

        const categoryId =
          localStorage.getItem(
            "category_id"
          );

        const data =
          await getLiveStreams(
            saved.host,
            saved.username,
            saved.password,
            categoryId
          );

        setChannels(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.log(error);

        setChannels([]);
      }

      setLoading(false);
    }

    loadChannels();

  }, []);

  // AUTO SCROLL
  useEffect(() => {

    const element =
      document.getElementById(
        `channel-${focused}`
      );

    if (element) {

      element.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

  }, [focused]);

  // REMOTE NAVIGATION
  useEffect(() => {

    function handleKeys(event) {

      // SEARCH
      if (
        event.keyCode ===
        KEYS.GREEN
      ) {

        focusManager.setZone(
          "modal"
        );

        setSearchOpen(true);

        return;
      }

      // SEARCH OPEN
      if (searchOpen) return;

      switch (event.keyCode) {

        // LEFT
        case KEYS.LEFT:

          // CONTENT → CATEGORY
          if (
            focusManager.getZone()
            === "content"
          ) {

            focusManager.setZone(
              "categories"
            );

            console.log(
              "CATEGORY ZONE"
            );

            return;
          }

          // CATEGORY → SIDEBAR
          if (
            focusManager.getZone()
            === "categories"
          ) {

            focusManager.setZone(
              "sidebar"
            );

            console.log(
              "SIDEBAR ZONE"
            );

            return;
          }

          // NORMAL GRID
          if (focused > 0) {

            const newIndex =
              focused - 1;

            setFocused(
              newIndex
            );

            focusManager.setChannel(
              newIndex
            );
          }

          break;

        // RIGHT
        case KEYS.RIGHT:

          // SIDEBAR → CATEGORY
          if (
            focusManager.getZone()
            === "sidebar"
          ) {

            focusManager.setZone(
              "categories"
            );

            console.log(
              "CATEGORY ZONE"
            );

            return;
          }

          // CATEGORY → CONTENT
          if (
            focusManager.getZone()
            === "categories"
          ) {

            focusManager.setZone(
              "content"
            );

            console.log(
              "CONTENT ZONE"
            );

            return;
          }

          // NORMAL GRID
          if (
            focused <
            channels.length - 1
          ) {

            const newIndex =
              focused + 1;

            setFocused(
              newIndex
            );

            focusManager.setChannel(
              newIndex
            );
          }

          break;

        // UP
        case KEYS.UP:

          if (
            focused - 4 >= 0
          ) {

            const newIndex =
              focused - 4;

            setFocused(
              newIndex
            );

            focusManager.setChannel(
              newIndex
            );
          }

          break;

        // DOWN
        case KEYS.DOWN:

          if (
            focused + 4 <
            channels.length
          ) {

            const newIndex =
              focused + 4;

            setFocused(
              newIndex
            );

            focusManager.setChannel(
              newIndex
            );
          }

          break;

        // FAVORITE
        case KEYS.RED:

          if (
            !channels[focused]
          ) return;

          const current =
            channels[focused];

          if (
            isFavorite(
              current.stream_id
            )
          ) {

            removeFavorite(
              current.stream_id
            );

          } else {

            addFavorite(
              current
            );
          }

          break;

        // ENTER
        case KEYS.ENTER:

          if (
            !channels[focused]
          ) return;

          localStorage.setItem(
            "stream_id",
            channels[focused]
              .stream_id
          );

          localStorage.setItem(
            "stream_name",
            channels[focused]
              .name
          );

          localStorage.setItem(
            "stream_type",
            "live"
          );

          navigationManager.push(
            "/channels"
          );

          navigateTo("/player");

          break;

        // BACK
        case KEYS.BACK:

          navigateTo("/dashboard");

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
    channels,
    searchOpen
  ]);

  // LOADING
  if (loading) {

    return (

      <div style={{
        width: "100%",
        height: "100vh",
        background: "#111",
        color: "white",
        display: "flex",
        justifyContent:
          "center",
        alignItems: "center",
        fontSize: "35px"
      }}>

        Loading Channels...

      </div>
    );
  }

  return (

    <div style={{
      background: "#111",
      minHeight: "100vh",
      color: "white",
      padding: "30px",
      overflowY: "auto"
    }}>

      {/* HEADER */}

      <div style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        marginBottom: "30px"
      }}>

        <h1 style={{
          fontSize: "40px"
        }}>
          LIVE CHANNELS
        </h1>

        <div style={{
          display: "flex",
          gap: "30px",
          fontSize: "20px",
          color: "#00aaff"
        }}>

          <div>
            GREEN = SEARCH
          </div>

          <div>
            RED = FAVORITE
          </div>

        </div>

      </div>

      {/* CHANNEL GRID */}

      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(4, 1fr)",
        gap: "20px"
      }}>

        {
          channels.map(
            (channel, index) => (

            <div
              id={`channel-${index}`}
              key={channel.stream_id}
              style={{

                background:
                  focused === index
                    ? "#00aaff"
                    : "#222",

                border:
                  focused === index
                    ? "4px solid white"
                    : "4px solid transparent",

                transform:
                  focused === index
                    ? "scale(1.05)"
                    : "scale(1)",

                transition:
                  "all 0.2s ease",

                padding: "20px",

                borderRadius: "12px",

                boxShadow:
                  focused === index
                    ? "0 0 20px rgba(0,170,255,0.8)"
                    : "none"
              }}
            >

              {/* TITLE */}

              <div style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "15px"
              }}>

                <div style={{
                  fontSize: "20px",
                  fontWeight: "bold"
                }}>

                  {channel.name}

                </div>

                {
                  isFavorite(
                    channel.stream_id
                  ) && (

                    <div style={{
                      color: "yellow",
                      fontSize: "24px"
                    }}>
                      ★
                    </div>

                  )
                }

              </div>

              {/* ICON */}

              {
                channel.stream_icon && (

                  <img
                    src={
                      channel.stream_icon
                    }
                    alt=""
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit:
                        "contain",
                      background:
                        "#000",
                      borderRadius:
                        "10px"
                    }}
                  />

                )
              }

            </div>

          ))
        }

      </div>

      {/* SEARCH */}

      <SearchModal
        visible={searchOpen}
        items={channels}
        onClose={() => {

          setSearchOpen(false);

          focusManager.setZone(
            "content"
          );

        }}
        onSelect={(item) => {

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
            "live"
          );

          navigationManager.push(
            "/channels"
          );

          navigateTo("/player");
        }}
      />

    </div>
  );
}