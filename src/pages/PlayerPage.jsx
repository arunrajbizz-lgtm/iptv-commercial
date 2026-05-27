import { navigateTo } from "../utils/navigation";
import Hls from 'hls.js';
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

import AudioSubtitleSelector
from "../components/AudioSubtitleSelector";

import MiniGuide
from "../components/MiniGuide";

import MultiView
from "../components/MultiView";

import EPGOverlay
from "../components/EPGOverlay";

import PlayerControls
from "../components/PlayerControls";

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

  const [isBrowser, setIsBrowser] = useState(!window.tizen);

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

  const [hlsInstance,
    setHlsInstance] = useState(null);

  const [streamType,
    setStreamType] = useState("");

  const [,
    setStreamUrl] =
    useState("");

  const [favorite,
    setFavorite] =
    useState(false);

  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [progress, setProgress] = useState(0);

  // INIT
  useEffect(() => {

    focusManager.setZone(
      "player"
    );

    document.documentElement.classList.add("player-active");

    initializePlayer();

    // PROGRESS TIMER
    const timer = setInterval(() => {
      try {
        const video = hlsInstance && hlsInstance.media
          ? hlsInstance.media
          : !window.tizen ? document.getElementById("browser-video")
          : avplayManager;
          
        if (!video) return;

        const cur = !window.tizen ? video.currentTime : video.getCurrentTime();
        const dur = !window.tizen ? video.duration : video.getDuration();

        if (dur > 0) {
          setProgress((cur / dur) * 100);
          setDuration(formatTime(dur));
        }
        setCurrentTime(formatTime(cur));
      } catch (e) {}
    }, 1000);

    return () => {
      document.documentElement.classList.remove("player-active");
      clearInterval(timer);
      clearTimeout(window.liveFallbackTimeout);
      try {
        if (hlsInstance) {
          hlsInstance.destroy();
        }

        avplayManager.stop();

      } catch (error) {
        console.log(error);
      }
    };
  }, [hlsInstance]);

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const startStreaming = async (finalUrl) => {
    // Clean up previous Hls.js instance if it exists
    if (hlsInstance) {
      hlsInstance.destroy();
      setHlsInstance(null);
    }

    if (!window.tizen) {
      // Browser fallback
      const video = document.getElementById("browser-video");
      if (!video) {
        console.error("Browser video element not found.");
        return;
      }

      if (finalUrl.endsWith(".m3u8") && Hls.isSupported()) {
        console.log("Using optimized hls.js for M3U8 stream.");
        
        // --- OPTIMIZED HLS CONFIG ---
        const hlsConfig = {
          manifestLoadingMaxRetry: 10,
          manifestLoadingRetryDelay: 1000,
          levelLoadingMaxRetry: 5,
          fragLoadingMaxRetry: 5,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        };

        const hls = new Hls(hlsConfig);
        
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("Fatal network error, trying to recover...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Fatal media error, trying to recover...");
                hls.recoverMediaError();
                break;
              default:
                console.error("Unrecoverable fatal error:", data);
                hls.destroy();
                break;
            }
          }
        });

        hls.loadSource(finalUrl);
        hls.attachMedia(video);
        
        video.play().catch(e => {
          console.log("Autoplay prevented, user interaction might be needed", e);
        });
        
        setHlsInstance(hls);
      } else {
        console.log("Using native HTML5 video for stream.");
        video.src = finalUrl;
        video.play().catch(e => console.error("Native play failed", e));
      }
    } else {
      // Tizen Native
      try {
        await avplayManager.stop();
      } catch (e) {}
      await avplayManager.initialize("avplay-container");
      await avplayManager.play(finalUrl);
    }
  };

  const getCurrentTime = () => {
    if (hlsInstance && hlsInstance.media) {
      return hlsInstance.media.currentTime || 0;
    }
    if (!window.tizen) {
      return document.getElementById("browser-video")?.currentTime || 0;
    }
    return avplayManager.getCurrentTime();
  };

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

      const sType =
        localStorage.getItem(
          "stream_type"
        );

      setStreamType(sType);

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
      else if (sType === "live") {
        url = buildLiveUrl(iptv.host, iptv.username, iptv.password, streamId, "ts");
      }

      // MOVIE
      else if (
        sType === "movie"
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

      if (sType === "live" && !storedStreamUrl) {
        // First try .ts
        console.log("Trying .ts first for Live TV");
        await startStreaming(url);

        // Smart Fallback: Only switch if not playing after 15 seconds
        window.liveFallbackTimeout = setTimeout(async () => {
          const currentId = localStorage.getItem("stream_id");
          if (currentId !== streamId) return;

          const state = window.tizen ? avplayManager.getState() : "PLAYING";
          if (state !== "PLAYING") {
            console.log("Live TV Fallback Triggered. State:", state);
            const fallbackUrl = buildLiveUrl(iptv.host, iptv.username, iptv.password, streamId, "m3u8");
            if (window.tizen) {
              try { await avplayManager.stop(); } catch (e) {}
            }
            await startStreaming(fallbackUrl);
            setStreamUrl(fallbackUrl);
          } else {
            console.log("Live TV: Stream is stable, skipping fallback.");
          }
        }, 15000);

      } else {
        await startStreaming(url);
      }

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

          if (!window.tizen) {
            const video = document.getElementById("browser-video");
            if (video) video.currentTime = resume.currentTime;
          } else {
            avplayManager.seek(resume.currentTime);
          }
          
        }, 4000);
      }

      setLoading(false);

      autoHide();

    } catch (error) {

      console.log(error);

      alert(
        "Playback Failed: " + (error.message || "Unknown error")
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

        // PLAY/PAUSE
        case KEYS.PLAY:
        case 415:
          if (!window.tizen) {
            document.getElementById("browser-video")?.play();
          } else {
            avplayManager.resume();
          }
          setPaused(false);
          break;

        case KEYS.PAUSE:
        case 19:
          if (!window.tizen) {
            document.getElementById("browser-video")?.pause();
          } else {
            avplayManager.pause();
          }
          setPaused(true);
          break;

        // FORWARD / REVERSE
        case KEYS.FF:
        case 417:
          if (streamType !== "live") {
            const target = getCurrentTime() + 30;
            if (!window.tizen) document.getElementById("browser-video").currentTime = target;
            else avplayManager.seek(target);
          }
          break;

        case KEYS.RW:
        case 412:
          if (streamType !== "live") {
            const target = Math.max(0, getCurrentTime() - 30);
            if (!window.tizen) document.getElementById("browser-video").currentTime = target;
            else avplayManager.seek(target);
          }
          break;

        // ENTER
        case KEYS.ENTER:

          setShowControls(
            prev => !prev
          );

          break;

        // STOP
        case KEYS.STOP:

          if (hlsInstance) {
            hlsInstance.destroy();
            setHlsInstance(null);
          } else if (!window.tizen) {
            const v = document.getElementById("browser-video"); if (v) v.src = "";
          } else {
            avplayManager.stop();
          }

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

          if (hlsInstance) {
            hlsInstance.destroy();
            setHlsInstance(null);
          } else if (!window.tizen) {
            const v = document.getElementById("browser-video"); if (v) v.src = "";
          } else {
            avplayManager.stop();
          }

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
    favorite,
    hlsInstance,
    streamType
  ]);

  // HISTORY
  useEffect(() => {

    const interval =
      setInterval(() => {

        try {
          const video = hlsInstance && hlsInstance.media
            ? hlsInstance.media
            : !window.tizen ? document.getElementById("browser-video")
            : avplayManager;
            
          const current = !window.tizen ? video.currentTime : video.getCurrentTime();
          const duration = !window.tizen ? video.duration : video.getDuration();

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
    streamName,
    hlsInstance
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

      setStreamType("live");

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

          channel.stream_id,
          "ts"
        );

      clearTimeout(window.liveFallbackTimeout);

      setLoading(true);

      // First try .ts
      console.log("Trying .ts first for Live TV Channel Change");
      await startStreaming(url);

      // Give 15 sec to re-try next (.m3u8)
      window.liveFallbackTimeout = setTimeout(async () => {
        // Verify we are still looking at the same stream before falling back
        const currentId = localStorage.getItem("stream_id");
        if (currentId === channel.stream_id) {
          const state = window.tizen ? avplayManager.getState() : "PLAYING";
          if (state !== "PLAYING") {
            console.log("Live TV Fallback: Switching to .m3u8 after timeout");
            const fallbackUrl = buildLiveUrl(iptv.host, iptv.username, iptv.password, channel.stream_id, "m3u8");
            if (window.tizen) {
              try {
                await avplayManager.stop();
              } catch (e) {}
            }
            await startStreaming(fallbackUrl);
            setStreamUrl(fallbackUrl);
          }
        }
      }, 15000);

      setLoading(false);

    } catch (error) {

      console.log(error);
    }
  }

  const [showSettings, setShowSettings] = useState(false);

  const handleAction = (id) => {
    autoHide();
    const video = hlsInstance && hlsInstance.media
      ? hlsInstance.media
      : !window.tizen ? document.getElementById("browser-video")
      : avplayManager;

    if (!video) return;

    switch (id) {
      case "PLAY_PAUSE":
        if (paused) {
          if (!window.tizen) video.play();
          else avplayManager.resume();
          setPaused(false);
        } else {
          if (!window.tizen) video.pause();
          else avplayManager.pause();
          setPaused(true);
        }
        break;

      case "RW":
        if (streamType !== "live") {
          const target = Math.max(0, getCurrentTime() - 30);
          if (!window.tizen) video.currentTime = target;
          else avplayManager.seek(target);
        }
        break;

      case "FF":
        if (streamType !== "live") {
          const target = getCurrentTime() + 30;
          if (!window.tizen) video.currentTime = target;
          else avplayManager.seek(target);
        }
        break;

      case "PREV":
        previousChannel();
        break;

      case "NEXT":
        nextChannel();
        break;

      case "FAVORITE":
        toggleCurrentFavorite();
        break;

      case "AUDIO_SUB":
        setShowSettings(true);
        focusManager.setZone("modal");
        break;

      case "EPG":
        setShowEPG(true);
        focusManager.setZone("overlay");
        break;

      case "MULTIVIEW":
        setShowMulti(true);
        focusManager.setZone("overlay");
        break;

      default:
        break;
    }
  };

  return (

    <div style={{
      width: "100%",
      height: "100vh",
      background: "transparent",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* PLAYER */}

      <div
        id="avplay-container"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          background: "transparent"
        }}
      />

      {/* BROWSER VIDEO FALLBACK */}
      {!window.tizen && (
        <video
          id="browser-video"
          style={{ width: "100%", height: "100%", objectFit: "contain", position: "absolute", top: 0, left: 0, zIndex: 2 }}
          onPause={() => setPaused(true)}
          onPlay={() => setPaused(false)}
          controls={false}
        />
      )}

      {/* PLAYER HEADER */}
      {showControls && (
        <header className="player-header fade-in">
           <div className="player-title">{streamName}</div>
           {streamType === "live" && <div className="badge" style={{ background: "var(--primary)", border: "none" }}>LIVE</div>}
        </header>
      )}

      {/* LOADING */}

      {
        loading && (
          <div className="netflix-loader" style={{ zIndex: 99999 }} />
        )
      }

      {/* NEW CONTROLS */}
      <div style={{ position: "relative", zIndex: 10000 }}>
        <PlayerControls
          visible={showControls}
          channelName={streamName}
          onAction={handleAction}
          paused={paused}
          streamType={streamType}
          currentTime={currentTime}
          duration={duration}
          progress={progress}
          isFavorite={favorite}
        />
      </div>

      {/* SETTINGS */}
      <AudioSubtitleSelector
        visible={showSettings}
        videoRef={{ current: hlsInstance?.media || (!window.tizen ? document.getElementById("browser-video") : null) }}
        onClose={() => setShowSettings(false)}
      />

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
