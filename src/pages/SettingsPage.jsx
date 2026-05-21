import { navigateTo } from "../utils/navigation";
import { useEffect, useState } from "react";
import { KEYS } from "../utils/tizenRemote";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";

export default function SettingsPage() {
  const settings = [
    { id: "autoplay", title: "Auto Play", type: "toggle" },
    { id: "multiview", title: "Enable Multi View", type: "toggle" },
    { id: "parental", title: "Parental Control", type: "toggle" },
    { id: "streamformat", title: "Preferred Stream Format", type: "option", options: ["m3u8", "ts", "mp4"] },
    { id: "clearcache", title: "Clear Cache", type: "action" },
    { id: "logout", title: "Logout", type: "action" }
  ];

  const [focused, setFocused] = useState(0);
  const [config, setConfig] = useState({
    autoplay: true,
    multiview: true,
    parental: false,
    streamformat: "m3u8"
  });

  useEffect(() => {
    focusManager.setZone("content");
    const saved = JSON.parse(localStorage.getItem("settings"));
    if (saved) setConfig(saved);
  }, []);

  useEffect(() => {
    const el = document.querySelector(`[data-setting-index="${focused}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focused]);

  function saveSettings(updated) {
    setConfig(updated);
    localStorage.setItem("settings", JSON.stringify(updated));
  }

  useEffect(() => {
    function handleKeys(event) {
      if (focusManager.getZone() === "sidebar") return;

      switch (event.keyCode) {
        case KEYS.UP:
          if (focused > 0) setFocused(prev => prev - 1);
          break;
        case KEYS.DOWN:
          if (focused < settings.length - 1) setFocused(prev => prev + 1);
          break;
        case KEYS.LEFT:
          if (settings[focused].type === "option") changeOption(-1);
          else focusManager.setZone("sidebar");
          break;
        case KEYS.RIGHT:
          if (settings[focused].type === "option") changeOption(1);
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
    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [focused, config]);

  function changeOption(direction) {
    const item = settings[focused];
    const current = config[item.id];
    const currentIndex = item.options.indexOf(current);
    let next = currentIndex + direction;
    if (next < 0) next = item.options.length - 1;
    if (next >= item.options.length) next = 0;
    saveSettings({ ...config, [item.id]: item.options[next] });
  }

  function activateSetting() {
    const item = settings[focused];
    if (item.type === "toggle") {
      saveSettings({ ...config, [item.id]: !config[item.id] });
    } else if (item.id === "clearcache") {
      localStorage.removeItem("movies");
      localStorage.removeItem("series");
      localStorage.removeItem("live_channels");
      alert("Cache Cleared");
    } else if (item.id === "logout") {
      localStorage.clear();
      navigateTo("/login");
    }
  }

  return (
    <div className="app-container">
      <Sidebar active="SETTINGS" />
      <main className="app-main browse-container">
        <h1 className="hero-title" style={{ fontSize: "60px", marginBottom: "50px" }}>Settings</h1>

        <div className="channel-list-v">
          {settings.map((item, index) => (
            <div
              key={item.id}
              data-setting-index={index}
              className={`channel-item ${focused === index ? "focused" : ""}`}
              onClick={activateSetting}
            >
              <div className="channel-name" style={{ flex: 1 }}>{item.title}</div>
              <div style={{ fontSize: "26px", fontWeight: "800", color: "var(--primary)" }}>
                {item.type === "toggle" ? (config[item.id] ? "ON" : "OFF") : (item.type === "option" ? config[item.id] : "")}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
