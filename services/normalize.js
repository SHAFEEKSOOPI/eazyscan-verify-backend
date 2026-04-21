function normalizeBarcode(value) {
  return String(value || "").replace(/[^\dA-Za-z\-]/g, "").trim();
}
function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}
function normalizeFilters(filters) {
  return {
    brand: normalizeText(filters.brand),
    product: normalizeText(filters.product),
    code: normalizeText(filters.code),
    style: normalizeText(filters.style),
    category: normalizeText(filters.category)
  };
}
// 🔥 STRONG BRAND NORMALIZATION
function normalizeBrand(raw) {
  const text = (raw || "").toLowerCase();
  // Calvin Klein (very important fix)
  if (
    text.includes("calvin") ||
    text.includes("klein") ||
    text.includes("ck") ||
    text.includes("pvh") ||
    text.includes("arvind")
  ) {
    return "Calvin Klein";
  }
  if (text.includes("nike")) return "Nike";
  if (text.includes("adidas")) return "Adidas";
  if (text.includes("zara")) return "Zara";
  if (text.includes("apple")) return "Apple";
  return raw || "";
}
module.exports = {
  normalizeBarcode,
  normalizeFilters,
  normalizeText,
  normalizeBrand
};
