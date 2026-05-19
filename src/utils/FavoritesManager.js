// LOAD
export function getFavorites() {

  try {

    return JSON.parse(

      localStorage.getItem(
        "favorites"
      )

    ) || [];

  } catch (error) {

    console.log(error);

    return [];
  }
}

// SAVE
export function saveFavorites(
  favorites
) {

  localStorage.setItem(

    "favorites",

    JSON.stringify(
      favorites
    )
  );
}

// EXISTS
export function isFavorite(
  streamId
) {

  const favorites =
    getFavorites();

  return favorites.some(

    item =>

      String(item.stream_id)
      ===
      String(streamId)
  );
}

// ADD
export function addFavorite(
  item
) {

  try {

    const favorites =
      getFavorites();

    // ALREADY
    const exists =
      favorites.find(

        fav =>

          String(fav.stream_id)
          ===
          String(item.stream_id)
      );

    if (exists) {

      return;
    }

    favorites.unshift(item);

    saveFavorites(
      favorites
    );

    console.log(
      "Favorite Added"
    );

  } catch (error) {

    console.log(error);
  }
}

// REMOVE
export function removeFavorite(
  streamId
) {

  try {

    const favorites =
      getFavorites();

    const updated =
      favorites.filter(

        item =>

          String(item.stream_id)
          !==
          String(streamId)
      );

    saveFavorites(
      updated
    );

    console.log(
      "Favorite Removed"
    );

  } catch (error) {

    console.log(error);
  }
}

// TOGGLE
export function toggleFavorite(
  item
) {

  if (

    isFavorite(
      item.stream_id
    )

  ) {

    removeFavorite(
      item.stream_id
    );

    return false;
  }

  addFavorite(item);

  return true;
}