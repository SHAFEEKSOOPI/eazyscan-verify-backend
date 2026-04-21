const axios = require("axios");
async function searchWeb({ brand, product }) {
  if (!brand && !product) return [];
  const query = [
  brand,
  product,
  "official",
  "buy",
  "product"
].filter(Boolean).join(" ");

  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(url);
    const results = [];
    const matches =
      data.match(/<a rel="nofollow" class="result__a" href="(.*?)">(.*?)<\/a>/g) || [];
    matches.slice(0, 5).forEach((item) => {
      const linkMatch = item.match(/href="(.*?)"/);
      const titleMatch = item.match(/>(.*?)<\/a>/);
      if (linkMatch) {
        results.push({
          url: linkMatch[1],
          title: titleMatch ? titleMatch[1] : "",
          image: "" // placeholder (can upgrade later with real scraping/API)
        });
      }
    });
    return results;
  } catch (e) {
    return [];
  }
}
module.exports = { searchWeb };
