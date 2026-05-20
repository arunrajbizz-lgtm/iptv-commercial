export default async function handler(req, res) {
  try {
    const { host, username, password, action = "" } = req.query;

    if (!host || !username || !password) {
      return res.status(400).json({ error: "Missing details" });
    }

    const cleanHost = String(host).replace(/\/+$/, "");
    const cleanAction = decodeURIComponent(String(action || ""));

    const apiUrl =
      `${cleanHost}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}${cleanAction}`;

    const response = await fetch(apiUrl);
    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    return res.status(response.status).send(text);
  } catch (error) {
    return res.status(500).json({
      error: "Proxy failed",
      message: error.message
    });
  }
}