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