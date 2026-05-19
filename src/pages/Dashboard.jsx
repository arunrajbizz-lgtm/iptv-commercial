import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import focusManager
from "../core/FocusManager";

import ContinueWatching
from "../components/ContinueWatching";

import RecentChannels
from "../components/RecentChannels";

import RecommendedRow
from "../components/RecommendedRow";

import VoiceSearchOverlay
from "../components/VoiceSearchOverlay";

export default function Dashboard() {

  // MENU
  const menu = [

    {
      name: "HOME",
      path: "/dashboard"
    },

    {
      name: "LIVE TV",
      path: "/live"
    },

    {
      name: "MOVIES",
      path: "/movies"
    },

    {
      name: "SERIES",
      path: "/series"
    },

    {
      name: "SEARCH",
      path: "/search"
    },

    {
      name: "FAVORITES",
      path: "/favorites"
    },

    {
      name: "SETTINGS",
      path: "/settings"
    }
  ];

  const [menuIndex,
    setMenuIndex] =
    useState(0);

  const [sidebarFocused,
    setSidebarFocused] =
    useState(true);

  const [showVoice,
    setShowVoice] =
    useState(false);

  // INIT
  useEffect(() => {

    focusManager.setZone(
      "sidebar"
    );

  }, []);

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      const zone =
        focusManager.getZone();

      // SIDEBAR
      if (
        zone === "sidebar"
      ) {

        switch (event.keyCode) {

          // UP
          case KEYS.UP:

            if (menuIndex > 0) {

              setMenuIndex(
                prev => prev - 1
              );
            }

            break;

          // DOWN
          case KEYS.DOWN:

            if (
              menuIndex <
              menu.length - 1
            ) {

              setMenuIndex(
                prev => prev + 1
              );
            }

            break;

          // RIGHT
          case KEYS.RIGHT:

            focusManager.setZone(
              "content"
            );

            setSidebarFocused(
              false
            );

            break;

          // ENTER
          case KEYS.ENTER:

            openMenu();

            break;

          // BLUE
          case KEYS.BLUE:

            openVoiceSearch();

            break;

          default:

            break;
        }
      }

      // CONTENT
      else {

        switch (event.keyCode) {

          // LEFT
          case KEYS.LEFT:

            focusManager.setZone(
              "sidebar"
            );

            setSidebarFocused(
              true
            );

            break;

          // BLUE
          case KEYS.BLUE:

            openVoiceSearch();

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
    menuIndex,
    sidebarFocused
  ]);

  // OPEN
  function openMenu() {

    const item =
      menu[menuIndex];

    if (!item) return;

    window.location.href =
      item.path;
  }

  // VOICE
  function openVoiceSearch() {

    setShowVoice(true);

    focusManager.setZone(
      "modal"
    );
  }

  // RESULT
  function handleVoiceResult(
    text
  ) {

    localStorage.setItem(
      "voice_search",
      text
    );

    window.location.href =
      "/search";
  }

  return (

    <div style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      background:
        "radial-gradient(circle at top, #1d1d1d, #000 70%)",
      overflow: "hidden",
      color: "white"
    }}>

      {/* SIDEBAR */}

      <div style={{
        width: "300px",
        height: "100%",
        background:
          "linear-gradient(to bottom, #101010, #050505)",
        borderRight:
          "2px solid rgba(255,255,255,0.05)",
        padding:
          "30px 20px"
      }}>

        {/* LOGO */}

        <div style={{
          fontSize: "48px",
          fontWeight: "bold",
          color: "#00aaff",
          marginBottom: "50px",
          textAlign: "center"
        }}>

          IPTV OTT

        </div>

        {/* VOICE */}

        <div style={{
          marginBottom: "30px",
          padding: "16px",
          borderRadius: "16px",
          background:
            "rgba(255,255,255,0.05)",
          textAlign: "center",
          fontSize: "18px",
          opacity: 0.75
        }}>

          BLUE BUTTON = VOICE SEARCH

        </div>

        {/* MENU */}

        <div style={{
          display: "flex",
          flexDirection:
            "column",
          gap: "18px"
        }}>

          {
            menu.map(
              (item, index) => (

              <div
                key={item.name}
                style={{

                  padding:
                    "22px 24px",

                  borderRadius:
                    "16px",

                  background:
                    sidebarFocused
                    &&
                    menuIndex === index
                      ? "#00aaff"
                      : "transparent",

                  border:
                    sidebarFocused
                    &&
                    menuIndex === index
                      ? "3px solid white"
                      : "3px solid transparent",

                  fontSize:
                    "24px",

                  fontWeight:
                    "bold",

                  transition:
                    "all 0.2s ease",

                  boxShadow:
                    sidebarFocused
                    &&
                    menuIndex === index
                      ? "0 0 24px rgba(0,170,255,0.8)"
                      : "none"
                }}
              >

                {item.name}

              </div>

            ))
          }

        </div>

      </div>

      {/* CONTENT */}

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "40px"
      }}>

        {/* HERO */}

        <div style={{
          marginBottom: "50px"
        }}>

          <div style={{
            fontSize: "66px",
            fontWeight: "bold",
            marginBottom: "18px"
          }}>

            Welcome Back

          </div>

          <div style={{
            fontSize: "26px",
            opacity: 0.78
          }}>

            Samsung IPTV OTT Platform

          </div>

        </div>

        {/* RECOMMENDED */}

        <RecommendedRow />

        {/* CONTINUE */}

        <ContinueWatching />

        {/* RECENT */}

        <RecentChannels />

      </div>

      {/* VOICE */}

      <VoiceSearchOverlay
        visible={showVoice}
        onResult={
          handleVoiceResult
        }
        onClose={() => {

          setShowVoice(false);

          focusManager.setZone(
            "content"
          );
        }}
      />

    </div>
  );
}