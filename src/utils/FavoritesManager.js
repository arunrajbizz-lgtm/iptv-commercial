/**
 * FAVORITES MANAGER (Advanced)
 * Supports multiple named lists.
 * Format: { "ListName": [items], ... }
 */

// MIGRATION & LOAD
export function getFavoriteLists() {
  try {
    const data = localStorage.getItem("favorites");
    if (!data) return { "General": [] };
    
    const parsed = JSON.parse(data);
    
    // Support old array format
    if (Array.isArray(parsed)) {
      return { "General": parsed };
    }
    
    return parsed;
  } catch (error) {
    console.error("Favorites Load Error:", error);
    return { "General": [] };
  }
}

// SAVE ALL
export function saveFavoriteLists(lists) {
  localStorage.setItem("favorites", JSON.stringify(lists));
}

// GET FAVORITES FOR A LIST
export function getFavorites(listName = "General") {
  const lists = getFavoriteLists();
  return lists[listName] || [];
}

// EXISTS IN ANY LIST (or specific list)
export function isFavorite(streamId, listName = null) {
  const lists = getFavoriteLists();
  
  if (listName) {
    return (lists[listName] || []).some(item => String(item.stream_id) === String(streamId));
  }
  
  // Check all lists
  return Object.values(lists).some(list => 
    list.some(item => String(item.stream_id) === String(streamId))
  );
}

// ADD TO LIST
export function addFavorite(item, listName = "General") {
  try {
    const lists = getFavoriteLists();
    
    if (!lists[listName]) {
      lists[listName] = [];
    }
    
    const exists = lists[listName].find(fav => String(fav.stream_id) === String(item.stream_id));
    if (exists) return;
    
    lists[listName].unshift(item);
    saveFavoriteLists(lists);
    
    console.log(`Added to ${listName}`);
  } catch (error) {
    console.error("Add Favorite Error:", error);
  }
}

// REMOVE FROM LIST
export function removeFavorite(streamId, listName = "General") {
  try {
    const lists = getFavoriteLists();
    
    if (!lists[listName]) return;
    
    lists[listName] = lists[listName].filter(item => String(item.stream_id) !== String(streamId));
    saveFavoriteLists(lists);
    
    console.log(`Removed from ${listName}`);
  } catch (error) {
    console.error("Remove Favorite Error:", error);
  }
}

// TOGGLE (Default list)
export function toggleFavorite(item, listName = "General") {
  if (isFavorite(item.stream_id, listName)) {
    removeFavorite(item.stream_id, listName);
    return false;
  }
  addFavorite(item, listName);
  return true;
}

// MANAGE LISTS
export function createList(name) {
  const lists = getFavoriteLists();
  if (lists[name]) return false;
  lists[name] = [];
  saveFavoriteLists(lists);
  return true;
}

export function deleteList(name) {
  if (name === "General") return false; // Protect default list
  const lists = getFavoriteLists();
  delete lists[name];
  saveFavoriteLists(lists);
  return true;
}

export function getListNames() {
  return Object.keys(getFavoriteLists());
}
