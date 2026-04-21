const axios = require("axios");
async function searchImages({ brand, product }) {
  const query = `${brand} ${product}`;
  try {
    const res = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_images",
        q: query,
        api_key: process.env.SERP_API_KEY
      }
    });
    const images = (res.data.images_results || []).slice(0, 5);
    return images.map(img => ({
      url: img.original,
      thumbnail: img.thumbnail,
      title: img.title,
      source: img.link
    }));
  } catch (e) {
    console.error("IMAGE SEARCH ERROR:", e.message);
    return [];
  }
}
module.exports = { searchImages };
