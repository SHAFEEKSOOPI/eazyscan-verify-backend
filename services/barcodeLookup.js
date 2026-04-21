const axios = require("axios");
async function lookupBarcode(barcode) {
  try {
    const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`;
    const { data } = await axios.get(url, {
      timeout: 12000,
      headers: {
        "User-Agent": "EazyScanVerify/1.0"
      }
    });
    if (data?.code === "OK" && Array.isArray(data.items) && data.items.length > 0) {
      return {
        found: true,
        candidates: data.items.map((item) => ({
          code: item.upc || item.ean || barcode,
          product_name: item.title || "",
          brand: item.brand || "",
          category: item.category || "",
          model: item.model || "",
          image_url: item.images?.[0] || "",
          product_url: item.offers?.[0]?.link || "",
          raw: item
        }))
      };
    }
    return { found: false, candidates: [] };
  } catch (error) {
    console.error("BARCODE LOOKUP ERROR:", error.message);
    return { found: false, candidates: [] };
  }
}
module.exports = {
  lookupBarcode
};
