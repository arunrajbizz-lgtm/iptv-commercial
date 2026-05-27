import { navigateTo } from "../utils/navigation";
import { useEffect, useState } from "react";
import { KEYS } from "../utils/tizenRemote";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";
import { 
  getFavoriteLists, 
  removeFavorite as removeFav, 
  getListNames,
  createList,
  deleteList,
  saveFavoriteLists
} from "../utils/FavoritesManager";

export default function FavoritesPage() {
  const [lists, setLists] = useState({});
  const [listNames, setListNames] = useState([]);
  const [activeListIndex, setActiveListIndex] = useState(0);
  const [focused, setFocused] = useState(0);
  const [zone, setZone] = useState("content"); // 'tabs' or 'content'

  useEffect(() => {
    focusManager.setZone("content");
    refreshData();
  }, []);

  function refreshData() {
    const allLists = getFavoriteLists();
    setLists(allLists);
    const names = Object.keys(allLists);
    setListNames(names);
  }

  const activeListName = listNames[activeListIndex] || "General";
  const currentItems = lists[activeListName] || [];

  useEffect(() => {
    function handleKeys(event) {
      if (focusManager.getZone() === "sidebar") return;

      switch (event.keyCode) {
        case KEYS.UP:
          if (zone === "content") {
            if (focused > 0) {
              setFocused(prev => prev - 1);
            } else {
              setZone("tabs");
            }
          }
          break;

        case KEYS.DOWN:
          if (zone === "tabs") {
            setZone("content");
          } else {
            if (focused < currentItems.length - 1) {
              setFocused(prev => prev + 1);
            }
          }
          break;

        case KEYS.LEFT:
          if (zone === "tabs") {
            if (activeListIndex > 0) setActiveListIndex(prev => prev - 1);
          } else {
            focusManager.setZone("sidebar");
          }
          break;

        case KEYS.RIGHT:
          if (zone === "tabs") {
            if (activeListIndex < listNames.length - 1) setActiveListIndex(prev => prev + 1);
          }
          break;

        case KEYS.ENTER:
          if (zone === "content") openFavorite();
          break;

        case KEYS.RED:
          if (zone === "content") removeFavorite();
          break;

        case KEYS.GREEN:
          const name = prompt("Enter new list name:");
          if (name && createList(name)) refreshData();
          break;

        case KEYS.YELLOW:
          if (activeListName !== "General" && confirm(`Delete list "${activeListName}"?`)) {
            deleteList(activeListName);
            setActiveListIndex(0);
            refreshData();
          }
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
  }, [focused, currentItems, zone, activeListIndex, listNames]);

  function openFavorite() {
    const item = currentItems[focused];
    if (!item) return;

    if (item.type === "series") {
      localStorage.setItem("selected_series", JSON.stringify(item));
      navigationManager.push("/favorites");
      navigateTo("/series-info");
      return;
    }

    localStorage.setItem("stream_id", item.stream_id);
    localStorage.setItem("stream_name", item.name);
    localStorage.setItem("stream_type", item.type);
    navigationManager.push("/favorites");
    navigateTo("/player");
  }

  function removeFavorite() {
    const item = currentItems[focused];
    if (!item) return;
    removeFav(item.stream_id, activeListName);
    refreshData();
    if (focused >= currentItems.length - 1) setFocused(Math.max(0, currentItems.length - 2));
  }

  return (
    <div className="app-container">
      <Sidebar active="FAVORITES" />
      <main className="app-main browse-container">
        <h1 className="hero-title" style={{ fontSize: "60px", marginBottom: "20px" }}>My Favorites</h1>
        
        {/* TABS */}
        <div className="tabs-row" style={{ display: "flex", gap: "20px", marginBottom: "30px", overflowX: "auto" }}>
          {listNames.map((name, index) => (
            <div
              key={name}
              className={`tab-item ${activeListIndex === index ? "active" : ""} ${zone === "tabs" && activeListIndex === index ? "focused" : ""}`}
              style={{
                padding: "15px 30px",
                borderRadius: "40px",
                background: activeListIndex === index ? "var(--primary)" : "rgba(255,255,255,0.1)",
                color: activeListIndex === index ? "black" : "white",
                fontWeight: "bold",
                fontSize: "20px",
                transition: "all 0.2s ease",
                border: zone === "tabs" && activeListIndex === index ? "4px solid white" : "4px solid transparent"
              }}
            >
              {name}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
          <p style={{ fontSize: "18px", color: "var(--red)", fontWeight: "bold" }}>RED = REMOVE</p>
          <p style={{ fontSize: "18px", color: "var(--green)", fontWeight: "bold" }}>GREEN = NEW LIST</p>
          <p style={{ fontSize: "18px", color: "var(--yellow)", fontWeight: "bold" }}>YELLOW = DELETE LIST</p>
        </div>

        {currentItems.length === 0 ? (
          <div style={{ fontSize: "30px", opacity: 0.5, marginTop: "100px", textAlign: "center" }}>
             This list is empty.
          </div>
        ) : (
          <div className="channel-list-v">
            {currentItems.map((item, index) => (
              <div
                key={index}
                className={`channel-item ${zone === "content" && focused === index ? "focused" : ""}`}
                onClick={openFavorite}
                style={{ height: "130px" }}
              >
                <img src={item.stream_icon || item.cover} alt="" className="channel-icon" style={{ width: "100px", height: "100px", borderRadius: "10px" }} />
                <div style={{ flex: 1 }}>
                  <div className="channel-name">{item.name}</div>
                  <div style={{ fontSize: "20px", color: "var(--text-dim)", textTransform: "uppercase" }}>{item.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
