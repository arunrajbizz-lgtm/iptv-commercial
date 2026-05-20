export default async function handler(req, res) {
  try {
    const { host, username, password, action = "" } = req.query;

    if (!host || !username || !password) {
      return res.status(400).json({ error: "Missing details" });
    }

    const cleanHost = String(host).replace(/\/+$/, "");

    const apiUrl =
      `${cleanHost}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}${decodeURIComponent(action)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Proxy failed",
      message: error.message
    });
  }
}