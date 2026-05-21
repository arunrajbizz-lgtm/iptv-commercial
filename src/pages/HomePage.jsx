import { navigateTo } from "../utils/navigation";
import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import {
  getLiveCategories,
  getLiveStreams
} from "../services/xtreamApi";

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

export default function HomePage() {

  const [categories,
    setCategories] =
    useState([]);

  const [channels,
    setChannels] =
    useState([]);

  const [selectedCategory,
    setSelectedCategory] =
    useState(0);

  const [focusedChannel,
    setFocusedChannel] =
    useState(0);

  const [loading,
    setLoading] =
    useState(true);

  const [searchOpen,
    setSearchOpen] =
    useState(false);

  // RESTORE
  useEffect(() => {

    const savedCategory =
      focusManager.getCategory();

    const savedChannel =
      focusManager.getChannel();

    setSelectedCategory(
      savedCategory
    );

    setFocusedChannel(
      savedChannel
    );

    focusManager.setZone(
      "content"
    );

  }, []);

  // LOAD CATEGORIES
  useEffect(() => {

    async function loadData() {

      try {

        const saved =
          JSON.parse(
            localStorage.getItem(
              "iptv"
            )
          );

        const cats =
          await getLiveCategories(
            saved.host,
            saved.username,
            saved.password
          );

        setCategories(cats);

        if (cats.length > 0) {

          const selected =
            cats[
              focusManager.getCategory()
            ] || cats[0];

          loadChannels(
            selected.category_id
          );
        }

      } catch (error) {

        console.log(error);
      }
    }

    loadData();

  }, []);

  // LOAD CHANNELS
  async function loadChannels(
    categoryId
  ) {

    try {

      setLoading(true);

      const saved =
        JSON.parse(
          localStorage.getItem(
            "iptv"
          )
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

  // AUTO SCROLL
  useEffect(() => {

    document
      .getElementById(
        `channel-${focusedChannel}`
      )
      ?.scrollIntoView({

        behavior: "smooth",

        block: "nearest"
      });

  }, [focusedChannel]);

  // REMOTE
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

      // SEARCH ACTIVE
      if (searchOpen) return;

      switch (event.keyCode) {

        // LEFT
        case KEYS.LEFT:

          if (focusedChannel % 4 === 0) {
            if (focusManager.getZone() === "content") {
              focusManager.setZone("categories");
            } else if (focusManager.getZone() === "categories") {
              focusManager.setZone("sidebar");
            }
          } else if (focusedChannel > 0) {
            const newIndex =
              focusedChannel - 1;

            setFocusedChannel(
              newIndex
            );

            focusManager.setChannel(
              newIndex
            );
          }

          break;

        // RIGHT
        case KEYS.RIGHT:

          if (focusManager.getZone() === "sidebar") {
            focusManager.setZone("categories");
          } else if (focusManager.getZone() === "categories") {
            focusManager.setZone("content");
          } else if (
            focusedChannel % 4 < 3 && 
            focusedChannel < channels.length - 1
          ) {
            const newIndex =
              focusedChannel + 1;

            setFocusedChannel(
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
            focusedChannel - 4 >= 0
          ) {

            const newIndex =
              focusedChannel - 4;

            setFocusedChannel(
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
            focusedChannel + 4 <
            channels.length
          ) {

            const newIndex =
              focusedChannel + 4;

            setFocusedChannel(
              newIndex
            );

            focusManager.setChannel(
              newIndex
            );
          }

          break;

        // CH+
        case 427:

          if (
            selectedCategory > 0
          ) {

            const next =
              selectedCategory - 1;

            setSelectedCategory(
              next
            );

            focusManager.setCategory(
              next
            );

            loadChannels(
              categories[next]
                .category_id
            );
          }

          break;

        // CH-
        case 428:

          if (
            selectedCategory <
            categories.length - 1
          ) {

            const next =
              selectedCategory + 1;

            setSelectedCategory(
              next
            );

            focusManager.setCategory(
              next
            );

            loadChannels(
              categories[next]
                .category_id
            );
          }

          break;

        // FAVORITE
        case KEYS.RED:

          if (
            !channels[
              focusedChannel
            ]
          ) return;

          const current =
            channels[
              focusedChannel
            ];

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
            !channels[
              focusedChannel
            ]
          ) return;

          localStorage.setItem(
            "stream_id",
            channels[
              focusedChannel
            ].stream_id
          );

          localStorage.setItem(
            "stream_name",
            channels[
              focusedChannel
            ].name
          );

          localStorage.setItem(
            "stream_type",
            "live"
          );

          navigationManager.push(
            "/dashboard"
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
    focusedChannel,
    channels,
    selectedCategory,
    categories,
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
          fontSize: "42px"
        }}>
          LIVE TV
        </h1>

        <div style={{
          display: "flex",
          gap: "25px",
          color: "#00aaff",
          fontSize: "20px"
        }}>

          <div>
            GREEN = SEARCH
          </div>

          <div>
            RED = FAVORITE
          </div>

        </div>

      </div>

      {/* CATEGORIES */}

      <div style={{
        display: "flex",
        gap: "15px",
        overflowX: "auto",
        marginBottom: "30px"
      }}>

        {
          categories.map(
            (cat, index) => (

            <div
              key={cat.category_id}
              style={{

                padding:
                  "14px 24px",

                borderRadius:
                  "10px",

                background:
                  selectedCategory
                  === index
                    ? "#00aaff"
                    : "#222",

                whiteSpace:
                  "nowrap",

                fontSize: "20px",

                border:
                  selectedCategory
                  === index
                    ? "3px solid white"
                    : "3px solid transparent"
              }}
            >

              {
                cat.category_name
              }

            </div>

          ))
        }

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
                  focusedChannel
                  === index
                    ? "#00aaff"
                    : "#222",

                border:
                  focusedChannel
                  === index
                    ? "4px solid white"
                    : "4px solid transparent",

                transform:
                  focusedChannel
                  === index
                    ? "scale(1.05)"
                    : "scale(1)",

                transition:
                  "all 0.2s ease",

                padding: "20px",

                borderRadius:
                  "12px",

                boxShadow:
                  focusedChannel
                  === index
                    ? "0 0 20px rgba(0,170,255,0.8)"
                    : "none"
              }}
            >

              {/* TITLE */}

              <div style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "15px"
              }}>

                <div style={{
                  fontSize: "20px",
                  fontWeight:
                    "bold"
                }}>

                  {channel.name}

                </div>

                {
                  isFavorite(
                    channel.stream_id
                  ) && (

                    <div style={{
                      color:
                        "yellow",
                      fontSize:
                        "24px"
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
            "/dashboard"
          );

          navigateTo("/player");
        }}
      />

    </div>
  );
}