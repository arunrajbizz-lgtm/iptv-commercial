export function getFavorites() {

  return JSON.parse(
    localStorage.getItem(
      "favorites"
    )
  ) || [];
}

export function addFavorite(item) {

  const favorites =
    getFavorites();

  const exists =
    favorites.find(
      fav =>
        fav.stream_id ===
        item.stream_id
    );

  if (!exists) {

    favorites.push(item);

    localStorage.setItem(
      "favorites",
      JSON.stringify(favorites)
    );
  }
}

export function removeFavorite(
  streamId
) {

  const favorites =
    getFavorites().filter(
      item =>
        item.stream_id !==
        streamId
    );

  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );
}

export function isFavorite(
  streamId
) {

  const favorites =
    getFavorites();

  return favorites.some(
    item =>
      item.stream_id === streamId
  );
}