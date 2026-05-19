const PLAYER_API =
  "/player_api.php";

// REQUEST
async function apiRequest(
  host,
  username,
  password,
  action = ""
) {

  try {

    // FIX HOST
    let fixedHost =
      host.trim();

    if (
      !fixedHost.startsWith(
        "http"
      )
    ) {

      fixedHost =
        `http://${fixedHost}`;
    }

    // REMOVE /
    fixedHost =
      fixedHost.replace(
        /\/$/,
        ""
      );

    const url =

      `${fixedHost}${PLAYER_API}?username=${username}&password=${password}${action}`;

    console.log(
      "XTREAM URL:",
      url
    );

    const response =
      await fetch(url, {

        method: "GET",

        headers: {

          Accept:
            "application/json"
        }
      });

    if (
      !response.ok
    ) {

      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    console.log(
      "XTREAM RESPONSE:",
      data
    );

    return data;

  } catch (error) {

    console.log(
      "Xtream API Error",
      error
    );

    return null;
  }
}

// TEST LOGIN
export async function testXtreamLogin(
  host,
  username,
  password
) {

  try {

    const data =
      await apiRequest(

        host,

        username,

        password
      );

    return !!data?.user_info;

  } catch (error) {

    console.log(error);

    return false;
  }
}

// LIVE CATEGORIES
export async function getLiveCategories(
  host,
  username,
  password
) {

  const data =
    await apiRequest(

      host,

      username,

      password,

      "&action=get_live_categories"
    );

  return data || [];
}

// LIVE STREAMS
export async function getLiveStreams(
  host,
  username,
  password,
  categoryId
) {

  const data =
    await apiRequest(

      host,

      username,

      password,

      `&action=get_live_streams&category_id=${categoryId}`
    );

  // SAVE
  localStorage.setItem(

    "live_channels",

    JSON.stringify(
      data || []
    )
  );

  return data || [];
}

// MOVIE CATEGORIES
export async function getMovieCategories(
  host,
  username,
  password
) {

  const data =
    await apiRequest(

      host,

      username,

      password,

      "&action=get_vod_categories"
    );

  return data || [];
}

// MOVIES
export async function getMovies(
  host,
  username,
  password,
  categoryId = ""
) {

  const data =
    await apiRequest(

      host,

      username,

      password,

      `&action=get_vod_streams&category_id=${categoryId}`
    );

  localStorage.setItem(

    "movies",

    JSON.stringify(
      data || []
    )
  );

  return data || [];
}

// SERIES CATEGORIES
export async function getSeriesCategories(
  host,
  username,
  password
) {

  const data =
    await apiRequest(

      host,

      username,

      password,

      "&action=get_series_categories"
    );

  return data || [];
}

// SERIES
export async function getSeries(
  host,
  username,
  password,
  categoryId = ""
) {

  const data =
    await apiRequest(

      host,

      username,

      password,

      `&action=get_series&category_id=${categoryId}`
    );

  localStorage.setItem(

    "series",

    JSON.stringify(
      data || []
    )
  );

  return data || [];
}

// EPG
export async function getEPG(
  host,
  username,
  password,
  streamId
) {

  const data =
    await apiRequest(

      host,

      username,

      password,

      `&action=get_simple_data_table&stream_id=${streamId}`
    );

  return data || {};
}

// LIVE URL
export function buildLiveUrl(
  host,
  username,
  password,
  streamId
) {

  const fixedHost =
    host.replace(/\/$/, "");

  return (

    `${fixedHost}/live/${username}/${password}/${streamId}.m3u8`
  );
}

// MOVIE URL
export function buildMovieUrl(
  host,
  username,
  password,
  streamId,
  extension = "mp4"
) {

  const fixedHost =
    host.replace(/\/$/, "");

  return (

    `${fixedHost}/movie/${username}/${password}/${streamId}.${extension}`
  );
}

// SERIES URL
export function buildSeriesUrl(
  host,
  username,
  password,
  episodeId,
  extension = "mp4"
) {

  const fixedHost =
    host.replace(/\/$/, "");

  return (

    `${fixedHost}/series/${username}/${password}/${episodeId}.${extension}`
  );
}