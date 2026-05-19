const API =
  "https://api.themoviedb.org/3";

const IMAGE =
  "https://image.tmdb.org/t/p/original";

// SEARCH
export async function searchTMDB(
  query,
  type = "movie",
  apiKey
) {

  try {

    // NO KEY
    if (!apiKey) {

      return [];
    }

    const response =
      await fetch(

        `${API}/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}`
      );

    const data =
      await response.json();

    return data.results || [];

  } catch (error) {

    console.log(
      "TMDB Search Error",
      error
    );

    return [];
  }
}

// DETAILS
export async function getTMDBDetails(
  id,
  type = "movie",
  apiKey
) {

  try {

    // NO KEY
    if (!apiKey) {

      return null;
    }

    const response =
      await fetch(

        `${API}/${type}/${id}?api_key=${apiKey}`
      );

    return await response.json();

  } catch (error) {

    console.log(
      "TMDB Details Error",
      error
    );

    return null;
  }
}

// IMAGE
export function getTMDBImage(
  path
) {

  if (!path) {

    return "";
  }

  return `${IMAGE}${path}`;
}

// FORMAT
export function formatRating(
  value
) {

  return Number(value || 0)
    .toFixed(1);
}