import { navigateTo } from "../utils/navigation";
import { useEffect, useState, useRef } from "react";
import { KEYS } from "../utils/tizenRemote";
import Sidebar from "../components/Sidebar";
import focusManager from "../core/FocusManager";
import navigationManager from "../core/NavigationManager";
import { useFocus } from "../hooks/useFocus";
import { 
  getFavoriteLists, 
  removeFavorite as removeFav, 
  createList,
  deleteList
} from "../utils/FavoritesManager";

export default function FavoritesPage() {
  const [lists, setLists] = useState({});
  const [listNames, setListNames] = useState([]);
  const [activeListIndex, setActiveListIndex] = useState(0);
  const [zone, setZone] = useState(focusManager.getZone());
  const [localZone, setLocalZone] = useState("content"); // 'tabs' or 'content'

  const tabRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    return focusManager.subscribe(newZone => {
      setZone(newZone);
    });
  }, []);

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

  const { focusIndex: tabIdx } = useFocus({
    containerRef: tabRef,
    columnCount: listNames.length,
    itemCount: listNames.length,
    isActive: zone === "content" && localZone === "tabs",
    onEnter: (index) => {
      setActiveListIndex(index);
      setLocalZone("content");
    },
    onBottomEdge: () => setLocalZone("content"),
    onLeftEdge: () => focusManager.setZone("sidebar"),
    onBack: () => navigateTo("/dashboard")
  });

  const { focusIndex: itemIdx } = useFocus({
    containerRef: listRef,
    columnCount: 1,
    itemCount: currentItems.length,
    isActive: zone === "content" && localZone === "content",
    onEnter: (index) => openFavorite(currentItems[index]),
    onTopEdge: () => setLocalZone("tabs"),
    onLeftEdge: () => focusManager.setZone("sidebar"),
    onBack: () => setLocalZone("tabs")
  });

  useEffect(() => {
    function handleColorKeys(e) {
      if (e.keyCode === KEYS.RED && localZone === "content") {
        const item = currentItems[itemIdx];
        if (item) {
          removeFav(item.stream_id, activeListName);
          refreshData();
        }
      }
      if (e.keyCode === KEYS.GREEN) {
        const name = prompt("Enter new list name:");
        if (name && createList(name)) refreshData();
      }
      if (e.keyCode === KEYS.YELLOW) {
        if (activeListName !== "General" && confirm(`Delete list "${activeListName}"?`)) {
          deleteList(activeListName);
          setActiveListIndex(0);
          refreshData();
        }
      }
    }
    document.addEventListener("keydown", handleColorKeys);
    return () => document.removeEventListener("keydown", handleColorKeys);
  }, [itemIdx, currentItems, activeListName, localZone]);

  function openFavorite(item) {
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

  return (
    <div className="app-container">
      <Sidebar active="FAVORITES" />
      <main className="app-main browse-container">
        <h1 className="hero-title" style={{ fontSize: "60px", marginBottom: "30px" }}>My Favorites</h1>
        
        {/* TABS */}
        <div className="seasons-row" ref={tabRef}>
          {listNames.map((name, index) => (
            <div
              key={name}
              data-focusable="true"
              className={`season-tab ${activeListIndex === index ? "active" : ""} ${zone === "content" && localZone === "tabs" && tabIdx === index ? "focused" : ""}`}
            >
              {name}
            </div>
          ))}
        </div>

        <div className="color-shortcuts">
          <p><span className="key-red">RED</span> REMOVE</p>
          <p><span className="key-green">GREEN</span> NEW LIST</p>
          <p><span className="key-yellow">YELLOW</span> DELETE LIST</p>
        </div>

        {currentItems.length === 0 ? (
          <div className="no-results">This list is empty.</div>
        ) : (
          <div className="channel-list-v" ref={listRef}>
            {currentItems.map((item, index) => (
              <div
                key={`${item.stream_id}-${index}`}
                data-focusable="true"
                className={`channel-item ${zone === "content" && localZone === "content" && itemIdx === index ? "focused" : ""}`}
                onClick={() => openFavorite(item)}
                style={{ height: "140px" }}
              >
                <div className="channel-logo">
                  <img src={item.stream_icon || item.cover || "assets/hero.png"} alt="" />
                </div>
                <div className="channel-main">
                  <div className="channel-name">{item.name}</div>
                  <div className="result-type">{item.type?.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
