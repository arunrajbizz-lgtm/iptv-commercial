import { useEffect, useState, useRef } from "react";
import focusManager from "../core/FocusManager";
import { navigateTo } from "../utils/navigation";
import { useFocus } from "../hooks/useFocus";

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

  const [zone, setZone] = useState(focusManager.getZone());
  const sidebarRef = useRef(null);

  useEffect(() => {
    return focusManager.subscribe(newZone => {
      setZone(newZone);
    });
  }, []);

  const { focusIndex, setFocusIndex } = useFocus({
    containerRef: sidebarRef,
    columnCount: 1,
    itemCount: items.length,
    isActive: zone === "sidebar",
    initialIndex: focusManager.getSidebar(),
    onEnter: (index) => {
      const item = items[index];
      navigateTo(item.path);
    },
    onLeftEdge: () => {
      // Stay in sidebar or do nothing
    },
    onFocusChange: (index) => {
      focusManager.setSidebar(index);
    }
  });

  const expanded = zone === "sidebar";

  return (
    <aside className={`app-sidebar ${expanded ? "expanded" : ""}`}>
      <div className="sidebar-logo">
        {expanded ? "STREAMVAULT" : "S"}
      </div>

      <nav className="sidebar-nav" ref={sidebarRef}>
        {items.map((item, index) => (
          <div
            key={item.id}
            data-focusable="true"
            className={`nav-item ${focusIndex === index && expanded ? "focused" : ""} ${active === item.id ? "active" : ""}`}
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
