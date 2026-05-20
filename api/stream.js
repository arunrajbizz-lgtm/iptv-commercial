export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("Missing stream url");
    }

    const streamUrl = decodeURIComponent(String(url));

    res.writeHead(302, {
      Location: streamUrl,
      "Access-Control-Allow-Origin": "*"
    });

    return res.end();
  } catch (error) {
    return res.status(500).send(error.message);
  }
}