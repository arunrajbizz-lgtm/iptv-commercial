import { navigateTo } from "../utils/navigation";
import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

export default function SettingsPage() {

  const settings = [

    {
      id: "autoplay",
      title: "Auto Play",
      type: "toggle"
    },

    {
      id: "multiview",
      title: "Enable Multi View",
      type: "toggle"
    },

    {
      id: "parental",
      title: "Parental Control",
      type: "toggle"
    },

    {
      id: "streamformat",
      title: "Preferred Stream Format",
      type: "option",
      options: [
        "m3u8",
        "ts",
        "mp4"
      ]
    },

    {
      id: "clearcache",
      title: "Clear Cache",
      type: "action"
    },

    {
      id: "logout",
      title: "Logout",
      type: "action"
    }
  ];

  const [focused,
    setFocused] =
    useState(0);

  const [config,
    setConfig] =
    useState({

      autoplay: true,

      multiview: true,

      parental: false,

      streamformat:
        "m3u8"
    });

  // INIT
  useEffect(() => {

    loadSettings();

  }, []);

  // LOAD
  function loadSettings() {

    try {

      const saved =
        JSON.parse(

          localStorage.getItem(
            "settings"
          )
        );

      if (saved) {

        setConfig(saved);
      }

    } catch (error) {

      console.log(error);
    }
  }

  // SAVE
  function saveSettings(
    updated
  ) {

    setConfig(updated);

    localStorage.setItem(

      "settings",

      JSON.stringify(updated)
    );
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
            settings.length - 1
          ) {

            setFocused(
              prev => prev + 1
            );
          }

          break;

        case KEYS.LEFT:

          changeOption(
            -1
          );

          break;

        case KEYS.RIGHT:

          changeOption(
            1
          );

          break;

        case KEYS.ENTER:

          activateSetting();

          break;

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
    config
  ]);

  // OPTION
  function changeOption(
    direction
  ) {

    const item =
      settings[focused];

    if (
      !item
      ||
      item.type !== "option"
    ) {

      return;
    }

    const current =
      config[item.id];

    const currentIndex =
      item.options.indexOf(
        current
      );

    let next =
      currentIndex + direction;

    if (next < 0) {

      next =
        item.options.length - 1;
    }

    if (
      next >=
      item.options.length
    ) {

      next = 0;
    }

    const updated = {

      ...config,

      [item.id]:
        item.options[next]
    };

    saveSettings(updated);
  }

  // ACTION
  function activateSetting() {

    const item =
      settings[focused];

    if (!item) return;

    // TOGGLE
    if (
      item.type === "toggle"
    ) {

      const updated = {

        ...config,

        [item.id]:
          !config[item.id]
      };

      saveSettings(updated);

      return;
    }

    // CLEAR CACHE
    if (
      item.id === "clearcache"
    ) {

      localStorage.removeItem(
        "movies"
      );

      localStorage.removeItem(
        "series"
      );

      localStorage.removeItem(
        "live_channels"
      );

      alert(
        "Cache Cleared"
      );

      return;
    }

    // LOGOUT
    if (
      item.id === "logout"
    ) {

      localStorage.clear();

      navigateTo("/login");
    }
  }

  // VALUE
  function getValue(item) {

    // TOGGLE
    if (
      item.type === "toggle"
    ) {

      return config[item.id]
        ? "ON"
        : "OFF";
    }

    // OPTION
    if (
      item.type === "option"
    ) {

      return config[item.id];
    }

    return "";
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
        marginBottom: "40px"
      }}>

        SETTINGS

      </div>

      {/* LIST */}

      <div style={{
        display: "flex",
        flexDirection:
          "column",
        gap: "20px"
      }}>

        {
          settings.map(
            (item, index) => (

            <div
              key={item.id}
              style={{

                display: "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                padding:
                  "26px",

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

              {/* TITLE */}

              <div style={{
                fontSize: "28px",
                fontWeight: "bold"
              }}>

                {item.title}

              </div>

              {/* VALUE */}

              <div style={{
                fontSize: "24px",
                opacity: 0.85
              }}>

                {
                  getValue(item)
                }

              </div>

            </div>

          ))
        }

      </div>

    </div>
  );
}