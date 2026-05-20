const PLAYER_API =
  "/player_api.php";

export function normalizeXtreamHost(host) {
  let fixedHost = String(host || "").trim();

  if (!fixedHost) {
    return "";
  }

  if (!/^https?:\/\//i.test(fixedHost)) {
    fixedHost = `http://${fixedHost}`;
  }

  fixedHost = fixedHost
    .replace(/\/player_api\.php.*$/i, "")
    .replace(/\/+$/, "");

  return fixedHost;
}

// REQUEST
async function apiRequest(
  host,
  username,
  password,
  action = ""
) {

  try {

    const fixedHost =
      normalizeXtreamHost(host);

   const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const url =
  `/api/xtream?host=${encodeURIComponent(fixedHost)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${encodeURIComponent(action)}`;
  
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

    return data;

  } catch (error) {

    console.log(
      "Xtream API Error",
      error
    );

    throw error;
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

    const userInfo =
      data?.user_info;

    const authenticated =
      userInfo?.auth === 1
      ||
      userInfo?.auth === "1";

    return {
      ok: !!authenticated,
      data,
      message:
        authenticated
          ? ""
          : userInfo?.message || "Invalid username, password, or server URL"
    };

  } catch (error) {

    return {
      ok: false,
      data: null,
      message:
        error?.message
        ||
        "Unable to connect. Check CORS/mixed-content rules on your hosted server."
    };
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
  categoryId = ""
) {
  const categoryQuery =
    categoryId
      ? `&category_id=${encodeURIComponent(categoryId)}`
      : "";

  const data =
    await apiRequest(

      host,

      username,

      password,

      `&action=get_live_streams${categoryQuery}`
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
    normalizeXtreamHost(host);

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
    normalizeXtreamHost(host);

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
    normalizeXtreamHost(host);

  return (

    `${fixedHost}/series/${username}/${password}/${episodeId}.${extension}`
  );
}
