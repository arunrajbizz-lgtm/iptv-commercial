import { navigateTo } from "../utils/navigation";
import {
  useEffect,
  useState
} from "react";

import {
  KEYS
} from "../utils/tizenRemote";

import {
  buildLiveUrl,
  buildMovieUrl,
  buildSeriesUrl
} from "../services/xtreamApi";

import avplayManager
from "../utils/AVPlayManager";

import MiniGuide
from "../components/MiniGuide";

import MultiView
from "../components/MultiView";

import EPGOverlay
from "../components/EPGOverlay";

import focusManager
from "../core/FocusManager";

import navigationManager
from "../core/NavigationManager";

import {
  saveResumePosition,
  getResumePosition
} from "../utils/ResumeManager";

import {
  saveContinueWatching,
  saveRecentChannel
} from "../utils/HistoryManager";

import {
  toggleFavorite,
  isFavorite
} from "../utils/FavoritesManager";

export default function PlayerPage() {

  const [loading,
    setLoading] =
    useState(true);

  const [paused,
    setPaused] =
    useState(false);

  const [showControls,
    setShowControls] =
    useState(true);

  const [showGuide,
    setShowGuide] =
    useState(false);

  const [showMulti,
    setShowMulti] =
    useState(false);

  const [showEPG,
    setShowEPG] =
    useState(false);

  const [channels,
    setChannels] =
    useState([]);

  const [currentIndex,
    setCurrentIndex] =
    useState(0);

  const [streamName,
    setStreamName] =
    useState("");

  const [,
    setStreamUrl] =
    useState("");

  const [favorite,
    setFavorite] =
    useState(false);

  // INIT
  useEffect(() => {

    focusManager.setZone(
      "player"
    );

    initializePlayer();

    return () => {

      try {

        avplayManager.stop();

      } catch (error) {

        console.log(error);
      }
    };

  }, []);

  // INIT PLAYER
  async function initializePlayer() {

    try {

      setLoading(true);

      const iptv =
        JSON.parse(

          localStorage.getItem(
            "iptv"
          )
        );

      const streamId =
        localStorage.getItem(
          "stream_id"
        );

      const streamType =
        localStorage.getItem(
          "stream_type"
        );

      const storedStreamUrl =
        localStorage.getItem(
          "stream_url"
        );

      const name =
        localStorage.getItem(
          "stream_name"
        );

      setStreamName(name);

      // FAVORITE
      setFavorite(

        isFavorite(streamId)
      );

      // CHANNELS
      const live =
        JSON.parse(

          localStorage.getItem(
            "live_channels"
          )
        ) || [];

      setChannels(live);

      const index =
        live.findIndex(

          item =>

            String(item.stream_id)
            ===
            String(streamId)
        );

      if (index >= 0) {

        setCurrentIndex(index);
      }

      let url = "";

      // LIVE
      if (
        storedStreamUrl
      ) {

        url =
          storedStreamUrl;
      }

      // LIVE
      else if (
        streamType === "live"
      ) {

        url =
          buildLiveUrl(

            iptv.host,

            iptv.username,

            iptv.password,

            streamId
          );
      }

      // MOVIE
      else if (
        streamType === "movie"
      ) {

        url =
          buildMovieUrl(

            iptv.host,

            iptv.username,

            iptv.password,

            streamId
          );
      }

      // SERIES
      else {

        url =
          buildSeriesUrl(

            iptv.host,

            iptv.username,

            iptv.password,

            streamId
          );
      }

      setStreamUrl(url);

      // INIT
      await avplayManager.initialize(
        "avplay-container"
      );

      // PLAY
      await avplayManager.play(
        url
      );

      // RESUME
      const resume =
        getResumePosition(
          streamId
        );

      if (
        resume
        &&
        resume.currentTime > 10
      ) {

        setTimeout(() => {

          avplayManager.seek(

            resume.currentTime
          );

        }, 4000);
      }

      setLoading(false);

      autoHide();

    } catch (error) {

      console.log(error);

      alert(
        "Playback Failed"
      );
    }
  }

  // AUTO HIDE
  function autoHide() {

    setShowControls(true);

    clearTimeout(
      window.controlsTimeout
    );

    window.controlsTimeout =
      setTimeout(() => {

        setShowControls(false);

      }, 5000);
  }

  // REMOTE
  useEffect(() => {

    function handleKeys(event) {

      autoHide();

      switch (event.keyCode) {

        // ENTER
        case KEYS.ENTER:

          setShowControls(
            prev => !prev
          );

          break;

        // PLAY
        case KEYS.PLAY:

          avplayManager.resume();

          setPaused(false);

          break;

        // PAUSE
        case KEYS.PAUSE:

          avplayManager.pause();

          setPaused(true);

          break;

        // STOP
        case KEYS.STOP:

          avplayManager.stop();

          navigateTo(navigationManager.back());

          break;

        // CHANNEL UP
        case KEYS.CH_UP:

          nextChannel();

          break;

        // CHANNEL DOWN
        case KEYS.CH_DOWN:

          previousChannel();

          break;

        // GREEN
        case KEYS.GREEN:

          setShowGuide(true);

          focusManager.setZone(
            "overlay"
          );

          break;

        // YELLOW
        case KEYS.YELLOW:

          setShowMulti(true);

          focusManager.setZone(
            "overlay"
          );

          break;

        // GUIDE
        case KEYS.GUIDE:

          setShowEPG(true);

          focusManager.setZone(
            "overlay"
          );

          break;

        // RED
        case KEYS.RED:

          toggleCurrentFavorite();

          break;

        // BACK
        case KEYS.BACK:

          avplayManager.stop();

          navigateTo(navigationManager.back());

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
    currentIndex,
    channels,
    favorite
  ]);

  // HISTORY
  useEffect(() => {

    const interval =
      setInterval(() => {

        try {

          const current =
            avplayManager
              .getCurrentTime();

          const duration =
            avplayManager
              .getDuration();

          const item = {

            stream_id:
              localStorage.getItem(
                "stream_id"
              ),

            name:
              streamName,

            stream_icon:
              localStorage.getItem(
                "stream_icon"
              ),

            type:
              localStorage.getItem(
                "stream_type"
              )
          };

          // CONTINUE
          saveContinueWatching(
            item
          );

          // RECENT
          if (
            item.type === "live"
          ) {

            saveRecentChannel(
              item
            );
          }

          // RESUME
          saveResumePosition(

            item.stream_id,

            current,

            duration
          );

        } catch (error) {

          console.log(error);
        }

      }, 10000);

    return () => {

      clearInterval(
        interval
      );
    };

  }, [
    streamName
  ]);

  // FAVORITE
  function toggleCurrentFavorite() {

    const item = {

      stream_id:
        localStorage.getItem(
          "stream_id"
        ),

      name:
        streamName,

      stream_icon:
        localStorage.getItem(
          "stream_icon"
        ),

      type:
        localStorage.getItem(
          "stream_type"
        )
    };

    const status =
      toggleFavorite(item);

    setFavorite(status);
  }

  // NEXT
  function nextChannel() {

    if (
      currentIndex
      <
      channels.length - 1
    ) {

      openChannel(
        currentIndex + 1
      );
    }
  }

  // PREVIOUS
  function previousChannel() {

    if (
      currentIndex > 0
    ) {

      openChannel(
        currentIndex - 1
      );
    }
  }

  // OPEN CHANNEL
  async function openChannel(
    index
  ) {

    try {

      const channel =
        channels[index];

      if (!channel) return;

      setCurrentIndex(index);

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

      setStreamName(
        channel.name
      );

      const iptv =
        JSON.parse(

          localStorage.getItem(
            "iptv"
          )
        );

      const url =
        buildLiveUrl(

          iptv.host,

          iptv.username,

          iptv.password,

          channel.stream_id
        );

      setStreamUrl(url);

      setLoading(true);

      await avplayManager.stop();

      await avplayManager.play(
        url
      );

      setLoading(false);

    } catch (error) {

      console.log(error);
    }
  }

  return (

    <div style={{
      width: "100%",
      height: "100vh",
      background:
        "#000",
      position:
        "relative",
      overflow:
        "hidden"
    }}>

      {/* PLAYER */}

      <div
        id="avplay-container"
        style={{
          width: "100%",
          height: "100%"
        }}
      />

      {/* LOADING */}

      {
        loading && (

          <div style={{
            position:
              "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 99999
          }}>

            <div className="loader" />

          </div>

        )
      }

      {/* CONTROLS */}

      {
        showControls && (

          <div style={{
            position:
              "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            padding: "40px",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
            color: "white",
            zIndex: 9999
          }}>

            {/* TITLE */}

            <div style={{
              fontSize: "42px",
              fontWeight: "bold",
              marginBottom: "16px"
            }}>

              {streamName}

            </div>

            {/* STATUS */}

            <div style={{
              display: "flex",
              gap: "26px",
              fontSize: "22px",
              opacity: 0.8,
              flexWrap: "wrap"
            }}>

              <div>

                {
                  paused
                    ? "PAUSED"
                    : "LIVE"
                }

              </div>

              <div>

                GREEN = MINI GUIDE

              </div>

              <div>

                GUIDE = EPG

              </div>

              <div>

                YELLOW = MULTIVIEW

              </div>

              <div>

                RED = {
                  favorite
                    ? "REMOVE FAVORITE"
                    : "ADD FAVORITE"
                }

              </div>

            </div>

          </div>

        )
      }

      {/* MINI GUIDE */}

      <MiniGuide
        visible={showGuide}
        channels={channels}
        currentIndex={
          currentIndex
        }
        onSelect={channel => {

          const index =
            channels.findIndex(

              item =>

                item.stream_id
                ===
                channel.stream_id
            );

          openChannel(index);

          setShowGuide(false);
        }}
        onClose={() => {

          setShowGuide(false);

          focusManager.setZone(
            "player"
          );
        }}
      />

      {/* MULTIVIEW */}

      <MultiView
        visible={showMulti}
        channels={channels}
        onClose={() => {

          setShowMulti(false);

          focusManager.setZone(
            "player"
          );
        }}
      />

      {/* EPG */}

      <EPGOverlay
        visible={showEPG}
        channel={
          channels[currentIndex]
        }
        onClose={() => {

          setShowEPG(false);

          focusManager.setZone(
            "player"
          );
        }}
      />

    </div>
  );
}
