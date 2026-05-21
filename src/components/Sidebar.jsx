import { useEffect, useState } from "react";
import { KEYS } from "../utils/tizenRemote";
import focusManager from "../core/FocusManager";
import { navigateTo } from "../utils/navigation";

export default function Sidebar({ active }) {
  const items = [
    { id: "HOME", label: "Home", icon: "🏠", path: "/dashboard" },
    { id: "LIVE", label: "Live TV", icon: "📺", path: "/live" },
    { id: "MOVIES", label: "Movies", icon: "🎬", path: "/movies" },
    { id: "SERIES", label: "Series", icon: "🎞️", path: "/series" },
    { id: "SEARCH", label: "Search", icon: "🔍", path: "/search" },
    { id: "FAVORITES", label: "My List", icon: "❤️", path: "/favorites" },
    { id: "SETTINGS", label: "Settings", icon: "⚙️", path: "/settings" }
  ];

  const [focused, setFocused] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const saved = focusManager.getSidebar();
    setFocused(saved);
  }, []);

  useEffect(() => {
    function handleKeys(event) {
      if (focusManager.getZone() !== "sidebar") return;

      switch (event.keyCode) {
        case KEYS.UP:
          if (focused > 0) {
            const next = focused - 1;
            setFocused(next);
            focusManager.setSidebar(next);
          }
          break;

        case KEYS.DOWN:
          if (focused < items.length - 1) {
            const next = focused + 1;
            setFocused(next);
            focusManager.setSidebar(next);
          }
          break;

        case KEYS.RIGHT:
          setExpanded(false);
          focusManager.setZone("content");
          break;

        case KEYS.ENTER:
          const item = items[focused];
          navigateTo(item.path);
          break;

        case KEYS.BACK:
          setExpanded(false);
          focusManager.setZone("content");
          break;

        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [focused]);

  // EXPAND ON ZONE
  useEffect(() => {
    const interval = setInterval(() => {
       const zone = focusManager.getZone();
       setExpanded(zone === "sidebar");
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className={`app-sidebar ${expanded ? "expanded" : ""}`}>
      <div className="sidebar-logo">
        {expanded ? "STREAMDECK" : "S"}
      </div>

      <nav className="sidebar-nav">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`nav-item ${focused === index && expanded ? "focused" : ""} ${active === item.id ? "active" : ""}`}
            onClick={() => navigateTo(item.path)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-text">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
