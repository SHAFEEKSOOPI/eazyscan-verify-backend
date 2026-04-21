const axios = require("axios");
async function enrichProduct({ brand, product, barcode }) {
  try {
    const query = `${brand} ${product} ${barcode || ""}`;
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url);
    // 🔥 Extract price (₹, $, etc)
    const priceMatch = data.match(/(₹|Rs\.?|INR|\$)\s?[\d,]+/g);
    let price_range = null;
    if (priceMatch && priceMatch.length) {
      const unique = [...new Set(priceMatch)].slice(0, 3);
      price_range = unique.join(" - ");
    }
    // 🔥 Extract model (basic AI-less detection)
    let model = null;
    if (/iphone\s?\d+/i.test(query)) {
      model = query.match(/iphone\s?\d+\s?(pro|max|mini)?/i)?.[0];
    }
    if (/rolex/i.test(query)) {
      model = "Rolex Model (Detected)";
    }
    return {
      price_range,
      model
    };
  } catch (e) {
    return {
      price_range: null,
      model: null
    };
  }
}
module.exports = { enrichProduct };
