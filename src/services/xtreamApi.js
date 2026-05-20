export function normalizeXtreamHost(host) {
  let fixedHost = String(host || "").trim();

  if (!fixedHost) return "";

  if (!/^https?:\/\//i.test(fixedHost)) {
    fixedHost = `http://${fixedHost}`;
  }

  fixedHost = fixedHost
    .replace(/\/player_api\.php.*$/i, "")
    .replace(/\/+$/, "");

  return fixedHost;
}

async function apiRequest(host, username, password, action = "") {
  try {
    const fixedHost = normalizeXtreamHost(host);

    const url =
      `/api/xtream?host=${encodeURIComponent(fixedHost)}` +
      `&username=${encodeURIComponent(username)}` +
      `&password=${encodeURIComponent(password)}` +
      `&action=${encodeURIComponent(action)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.log("Xtream API Error", error);
    throw error;
  }
}

export async function testXtreamLogin(host, username, password) {
  try {
    const data = await apiRequest(host, username, password);
    const userInfo = data?.user_info;

    const authenticated =
      userInfo?.auth === 1 || userInfo?.auth === "1";

    return {
      ok: !!authenticated,
      data,
      message: authenticated
        ? ""
        : userInfo?.message || "Invalid username, password, or server URL"
    };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message:
        error?.message ||
        "Unable to connect. Check CORS/mixed-content rules on your hosted server."
    };
  }
}

export async function getLiveCategories(host, username, password) {
  const data = await apiRequest(
    host,
    username,
    password,
    "&action=get_live_categories"
  );

  return data || [];
}

export async function getLiveStreams(
  host,
  username,
  password,
  categoryId = ""
) {
  const categoryQuery = categoryId
    ? `&category_id=${encodeURIComponent(categoryId)}`
    : "";

  const data = await apiRequest(
    host,
    username,
    password,
    `&action=get_live_streams${categoryQuery}`
  );

  localStorage.setItem("live_channels", JSON.stringify(data || []));

  return data || [];
}

export async function getMovieCategories(host, username, password) {
  const data = await apiRequest(
    host,
    username,
    password,
    "&action=get_vod_categories"
  );

  return data || [];
}

export async function getMovies(
  host,
  username,
  password,
  categoryId = ""
) {
  const data = await apiRequest(
    host,
    username,
    password,
    `&action=get_vod_streams&category_id=${encodeURIComponent(categoryId)}`
  );

  localStorage.setItem("movies", JSON.stringify(data || []));

  return data || [];
}

export async function getSeriesCategories(host, username, password) {
  const data = await apiRequest(
    host,
    username,
    password,
    "&action=get_series_categories"
  );

  return data || [];
}

export async function getSeries(
  host,
  username,
  password,
  categoryId = ""
) {
  const data = await apiRequest(
    host,
    username,
    password,
    `&action=get_series&category_id=${encodeURIComponent(categoryId)}`
  );

  localStorage.setItem("series", JSON.stringify(data || []));

  return data || [];
}

export async function getEPG(host, username, password, streamId) {
  const data = await apiRequest(
    host,
    username,
    password,
    `&action=get_simple_data_table&stream_id=${encodeURIComponent(streamId)}`
  );

  return data || {};
}

// LIVE URL - Tizen TV direct m3u8
export function buildLiveUrl(
  host,
  username,
  password,
  streamId,
  extension = "m3u8"
) {
  const fixedHost = normalizeXtreamHost(host);

  return `${fixedHost}/live/${username}/${password}/${streamId}.${extension}`;
}

// MOVIE URL - Tizen TV direct mp4
export function buildMovieUrl(
  host,
  username,
  password,
  streamId,
  extension = "mp4"
) {
  const fixedHost = normalizeXtreamHost(host);

  return `${fixedHost}/movie/${username}/${password}/${streamId}.${extension}`;
}

// SERIES URL - Tizen TV direct mp4
export function buildSeriesUrl(
  host,
  username,
  password,
  episodeId,
  extension = "mp4"
) {
  const fixedHost = normalizeXtreamHost(host);

  return `${fixedHost}/series/${username}/${password}/${episodeId}.${extension}`;
}