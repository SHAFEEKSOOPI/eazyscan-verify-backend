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
module.exports = {
  normalizeBarcode,
  normalizeFilters,
  normalizeText
};

function normalizeBrand(raw) {
  const text = (raw || "").toLowerCase();

  if (
    text.includes("pvh") ||
    text.includes("ck") ||
    text.includes("calvin")
  ) {
    return "Calvin Klein";
  }
  if (text.includes("nike")) return "Nike";
  if (text.includes("adidas")) return "Adidas";
  if (text.includes("zara")) return "Zara";
  return raw;
}