const axios = require("axios");
const SERP_API_KEY = process.env.SERP_API_KEY;
async function searchProduct({ query }) {
  try {
    const url = "https://serpapi.com/search.json";
    const { data } = await axios.get(url, {
      params: {
        engine: "google",
        q: query,
        api_key: SERP_API_KEY
      },
      timeout: 10000
    });
    const results = data?.organic_results || [];
    // 🔥 extract best product
    const best = results[0] || null;
    // 🔥 extract images
    const images = (data?.images_results || []).slice(0, 3);
    // 🔥 extract shopping results (PRICE)
    const shopping = data?.shopping_results || [];
    return {
      best_link: best?.link || null,
      title: best?.title || null,
      images: images.map(i => ({
        url: i.original,
        thumbnail: i.thumbnail
      })),
      price:
        shopping[0]?.price ||
        shopping[0]?.extracted_price ||
        null
    };
  } catch (err) {
    console.error("SERP ERROR:", err.message);
    return {
      best_link: null,
      images: [],
      price: null
    };
  }
}
module.exports = { searchProduct };
