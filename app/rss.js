export default async function handler(req, res) {
  const { channel_id } = req.query;

  if (!channel_id || !/^UC[a-zA-Z0-9_-]{20,}$/.test(channel_id)) {
    return res.status(400).json({ error: "Invalid channel_id" });
  }

  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel_id}`;

  try {
    const upstream = await fetch(feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MeraYouTubeBot/1.0)" }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: "Upstream fetch failed" });
    }

    const xml = await upstream.text();

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    // cache at the edge for 10 min, serve stale for a day while revalidating
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=86400");
    return res.status(200).send(xml);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch feed" });
  }
}

