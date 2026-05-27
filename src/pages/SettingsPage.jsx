import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";
import { useFocus } from "../hooks/useFocus";

export default function SettingsPage() {
  const settings = [
    { id: "autoplay", title: "Auto Play", type: "toggle" },
    { id: "multiview", title: "Enable Multi View", type: "toggle" },
    { id: "parental", title: "Parental Control", type: "toggle" },
    { id: "streamformat", title: "Preferred Stream Format", type: "option", options: ["m3u8", "ts", "mp4"] },
    { id: "clearcache", title: "Clear Cache", type: "action" },
    { id: "logout", title: "Logout", type: "action" }
  ];

  const [zone, setZone] = useState(focusManager.getZone());
  const [config, setConfig] = useState({
    autoplay: true,
    multiview: true,
    parental: false,
    streamformat: "m3u8"
  });
  const settingsRef = useRef(null);

  useEffect(() => {
    return focusManager.subscribe(newZone => {
      setZone(newZone);
    });
  }, []);

  useEffect(() => {
    focusManager.setZone("content");
    const saved = JSON.parse(localStorage.getItem("settings"));
    if (saved) setConfig(saved);
  }, []);

  const { focusIndex: focused } = useFocus({
    containerRef: settingsRef,
    columnCount: 1,
    itemCount: settings.length,
    isActive: zone === "content",
    onEnter: (index) => activateSetting(settings[index]),
    onLeftEdge: () => {
      if (settings[focused].type === "option") changeOption(settings[focused], -1);
      else focusManager.setZone("sidebar");
    },
    onRightEdge: () => {
      if (settings[focused].type === "option") changeOption(settings[focused], 1);
    },
    onBack: () => navigateTo("/dashboard")
  });

  function saveSettings(updated) {
    setConfig(updated);
    localStorage.setItem("settings", JSON.stringify(updated));
  }

  function changeOption(item, direction) {
    const current = config[item.id];
    const currentIndex = item.options.indexOf(current);
    let next = currentIndex + direction;
    if (next < 0) next = item.options.length - 1;
    if (next >= item.options.length) next = 0;
    saveSettings({ ...config, [item.id]: item.options[next] });
  }

  function activateSetting(item) {
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

        <div className="channel-list-v" ref={settingsRef}>
          {settings.map((item, index) => (
            <div
              key={item.id}
              data-focusable="true"
              className={`channel-item ${focused === index && zone === "content" ? "focused" : ""}`}
              onClick={() => activateSetting(item)}
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
