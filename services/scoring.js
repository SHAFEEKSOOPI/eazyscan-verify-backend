function safeText(v) {
  return String(v || "").trim().toLowerCase();
}
function includesLoose(a, b) {
  a = safeText(a);
  b = safeText(b);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}
function scoreCandidates({ candidates, barcode, filters, aiResult }) {
  const ai = aiResult?.candidate || {};
  return candidates.map((c) => {
    let score = 0;
    if (barcode && c.code && safeText(c.code) === safeText(barcode)) {
      score += 45;
    }
    if (filters.brand && includesLoose(c.brand, filters.brand)) {
      score += 15;
    }
    if (filters.product && includesLoose(c.product_name, filters.product)) {
      score += 15;
    }
    if (filters.category && includesLoose(c.category, filters.category)) {
      score += 10;
    }
    if (ai.brand && includesLoose(c.brand, ai.brand)) {
      score += 10;
    }
    if (ai.product_name && includesLoose(c.product_name, ai.product_name)) {
      score += 10;
    }
    if (ai.category && includesLoose(c.category, ai.category)) {
      score += 5;
    }
    if (ai.confidence) {
      score += Math.round(Number(ai.confidence) * 10);
    }
    return {
      ...c,
      score
    };
  }).sort((a, b) => b.score - a.score);
}
function buildDecision({ scored, aiResult, barcode }) {
  const ai = aiResult?.candidate || {};
  const top = scored[0];
  const second = scored[1];
  if (!top) {
    return {
      status: "not_found",
      confidence: Math.round((Number(ai.confidence || 0)) * 100),
      message: "No trusted product match found. Use Product Filter.",
      bestMatch: null,
      alternatives: []
    };
  }
  if (top.score >= 70 && (!second || top.score - second.score >= 15)) {
    return {
      status: "verified",
      confidence: Math.min(99, top.score),
      message: "Verified matching product found.",
      bestMatch: top,
      alternatives: scored.slice(1, 4)
    };
  }
  if (top.score >= 45 && second && Math.abs(top.score - second.score) < 15) {
    return {
      status: "multiple",
      confidence: top.score,
      message: "Multiple possible products found. Use Product Filter.",
      bestMatch: top,
      alternatives: scored.slice(1, 5)
    };
  }
  if (ai.suspicious_elements && ai.suspicious_elements.length > 0) {
    return {
      status: "suspicious",
      confidence: Math.round((Number(ai.confidence || 0)) * 100),
      message: "Product has suspicious visual or text signals.",
      bestMatch: top,
      alternatives: scored.slice(1, 4)
    };
  }
  return {
    status: "not_found",
    confidence: top.score,
    message: "No reliable verified match. Use Product Filter.",
    bestMatch: top,
    alternatives: scored.slice(1, 4)
  };
}
module.exports = {
  scoreCandidates,
  buildDecision
};