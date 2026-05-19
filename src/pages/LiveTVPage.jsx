import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import {
  getLiveCategories,
  getLiveStreams,
  getEPG
} from "../services/xtreamApi";

import focusManager
from "../core/FocusManager";

import navigationManager
from "../core/NavigationManager";

export default function LiveTVPage() {

  const [categories,
    setCategories] =
    useState([]);

  const [channels,
    setChannels] =
    useState([]);

  const [focusedCategory,
    setFocusedCategory] =
    useState(0);

  const [focusedChannel,
    setFocusedChannel] =
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

      if (
        !iptv
        ||
        iptv.type !== "xtream"
      ) {

        return;
      }

      const data =
        await getLiveCategories(

          iptv.host,

          iptv.username,

          iptv.password
        );

      setCategories(data || []);

      // FIRST
      if (
        data?.length
      ) {

        loadChannels(
          data[0]
            .category_id
        );
      }

    } catch (error) {

      console.log(error);
    }
  }

  // LOAD CHANNELS
  async function loadChannels(
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
        await getLiveStreams(

          iptv.host,

          iptv.username,

          iptv.password,

          categoryId
        );

      const channelsWithEPG =
        await Promise.all(

          (data || []).map(
            async item => {

              const epg =
                await getEPG(

                  iptv.host,

                  iptv.username,

                  iptv.password,

                  item.stream_id
                );

              return {

                ...item,

                epg:
                  epg?.epg_listings
                  || []
              };
            })
        );

      setChannels(
        channelsWithEPG
      );

      setFocusedChannel(0);

    } catch (error) {

      console.log(error);
    }
  }

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      // CATEGORY
      if (
        zone === "categories"
      ) {

        switch (event.keyCode) {

          // UP
          case KEYS.UP:

            if (
              focusedCategory > 0
            ) {

              const next =
                focusedCategory - 1;

              setFocusedCategory(
                next
              );

              loadChannels(

                categories[next]
                  ?.category_id
              );
            }

            break;

          // DOWN
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

              loadChannels(

                categories[next]
                  ?.category_id
              );
            }

            break;

          // RIGHT
          case KEYS.RIGHT:

            setZone(
              "channels"
            );

            break;

          // BACK
          case KEYS.BACK:

            window.location.href =
              navigationManager.back();

            break;

          default:

            break;
        }
      }

      // CHANNELS
      else {

        switch (event.keyCode) {

          // UP
          case KEYS.UP:

            if (
              focusedChannel > 0
            ) {

              setFocusedChannel(
                prev => prev - 1
              );
            }

            break;

          // DOWN
          case KEYS.DOWN:

            if (

              focusedChannel
              <
              channels.length - 1
            ) {

              setFocusedChannel(
                prev => prev + 1
              );
            }

            break;

          // LEFT
          case KEYS.LEFT:

            setZone(
              "categories"
            );

            break;

          // ENTER
          case KEYS.ENTER:

            openChannel();

            break;

          // BACK
          case KEYS.BACK:

            window.location.href =
              navigationManager.back();

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

    focusedCategory,

    focusedChannel,

    zone,

    categories,

    channels
  ]);

  // OPEN
  function openChannel() {

    const channel =
      channels[focusedChannel];

    if (!channel) return;

    localStorage.setItem(
      "stream_id",
      channel.stream_id
    );

    localStorage.setItem(
      "stream_name",
      channel.name
    );

    localStorage.setItem(
      "stream_icon",
      channel.stream_icon
    );

    localStorage.setItem(
      "stream_type",
      "live"
    );

    navigationManager.push(
      "/live"
    );

    window.location.href =
      "/player";
  }

  return (

    <div style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      background:
        "#000",
      color: "white",
      overflow:
        "hidden"
    }}>

      {/* CATEGORIES */}

      <div style={{
        width: "340px",
        height: "100%",
        background:
          "#111",
        overflowY:
          "auto",
        padding:
          "20px"
      }}>

        {/* TITLE */}

        <div style={{
          fontSize: "40px",
          fontWeight: "bold",
          marginBottom: "30px",
          color: "#00aaff"
        }}>

          LIVE TV

        </div>

        {
          categories.map(
            (item, index) => (

            <div
              key={
                item.category_id
              }
              style={{

                padding:
                  "20px",

                borderRadius:
                  "16px",

                marginBottom:
                  "16px",

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

                fontSize:
                  "24px",

                fontWeight:
                  "bold",

                transition:
                  "all 0.2s ease"
              }}
            >

              {
                item.category_name
              }

            </div>

          ))
        }

      </div>

      {/* CHANNELS */}

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "30px"
      }}>

        {/* TITLE */}

        <div style={{
          fontSize: "42px",
          fontWeight: "bold",
          marginBottom: "30px"
        }}>

          CHANNELS

        </div>

        {/* LIST */}

        <div style={{
          display: "flex",
          flexDirection:
            "column",
          gap: "18px"
        }}>

          {
            channels.map(
              (channel, index) => (

              <div
                key={
                  channel.stream_id
                }
                style={{

                  display: "flex",

                  gap: "20px",

                  padding:
                    "18px",

                  borderRadius:
                    "18px",

                  background:
                    zone ===
                    "channels"
                    &&
                    focusedChannel
                    === index
                      ? "#00aaff"
                      : "#1d1d1d",

                  border:
                    zone ===
                    "channels"
                    &&
                    focusedChannel
                    === index
                      ? "3px solid white"
                      : "2px solid rgba(255,255,255,0.08)",

                  transition:
                    "all 0.2s ease"
                }}
              >

                {/* LOGO */}

                <img
                  src={
                    channel.stream_icon
                  }
                  alt=""
                  style={{
                    width: "110px",
                    height: "110px",
                    borderRadius:
                      "16px",
                    objectFit:
                      "cover",
                    background:
                      "#000"
                  }}
                />

                {/* INFO */}

                <div style={{
                  flex: 1
                }}>

                  {/* NAME */}

                  <div style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    marginBottom:
                      "12px"
                  }}>

                    {
                      channel.name
                    }

                  </div>

                  {/* EPG */}

                  <div style={{
                    fontSize: "20px",
                    opacity: 0.78
                  }}>

                    {
                      channel.epg?.[0]
                        ?.title
                      ||
                      "No EPG Available"
                    }

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