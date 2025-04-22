const express = require('express');
const axios = require('axios');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Video Downloader API is running!');
});

app.get('/download', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      if (!ytdl.validateURL(url)) return res.json({ error: "Invalid YouTube URL" });
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { quality: '18' });
      return res.json({ video: format.url });
    }

    if (url.includes("tiktok.com")) {
      const result = await axios.get(`https://api.tiklydown.me/api/download?url=${encodeURIComponent(url)}`);
      if (!result.data?.data?.play) return res.json({ error: "Unable to fetch TikTok video." });
      return res.json({ video: result.data.data.play });
    }

    if (url.includes("facebook.com") || url.includes("fb.watch")) {
      const fbResult = await axios.get(`https://fbdownloader.online/api/analyze?url=${encodeURIComponent(url)}`);
      if (!fbResult.data?.links?.[0]?.url) return res.json({ error: "Unable to fetch Facebook video." });
      return res.json({ video: fbResult.data.links[0].url });
    }

    if (url.includes("instagram.com") || url.includes("instagr.am")) {
      const igResult = await axios.get(`https://api.igdownloader.app/insta/?url=${encodeURIComponent(url)}`);
      if (!igResult.data?.media || igResult.data.media.length === 0) return res.json({ error: "Unable to fetch Instagram video." });
      return res.json({ video: igResult.data.media[0].url });
    }

    return res.json({ error: "Unsupported platform or invalid link" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch video" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});