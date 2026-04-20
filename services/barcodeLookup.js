const axios = require("axios");
async function lookupBarcode(barcode) {
  try {
    const url = `https://world.openfoodfacts.net/api/v2/product/${encodeURIComponent(
      barcode
    )}?fields=code,product_name,brands,categories,image_url`;
    const { data } = await axios.get(url, {
      timeout: 12000,
      headers: {
        "User-Agent": "EazyScanVerify/1.0"
      }
    });
    if (data?.status === 1 && data?.product) {
      return {
        found: true,
        candidates: [
          {
            code: data.code || barcode,
            product_name: data.product.product_name || "",
            brand: data.product.brands || "",
            category: data.product.categories || "",
            image_url: data.product.image_url || ""
          }
        ]
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