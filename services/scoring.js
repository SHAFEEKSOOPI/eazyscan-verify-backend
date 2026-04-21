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

    if (c.source === "ai_vision") {
    score += 40; // base trust for AI detection
    }
    if (ai.brand && includesLoose(c.brand, ai.brand)) {
    score += 25;
    }
    if (ai.product_name && includesLoose(c.product_name, ai.product_name)) {
    score += 25;
    }
    if (ai.category && includesLoose(c.category, ai.category)) {
    score += 15;
    }
// 🔥 confidence boost
    if (ai.confidence) {
    score += Math.round(Number(ai.confidence) * 20);
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
  
  if (!scored.length && ai.brand) {
  return {
    status: "detected",
    confidence: Math.round((Number(ai.confidence || 0)) * 100),
    message: "AI detected product details",
    bestMatch: ai,
    alternatives: []
  };
}
  
  if (!top) {
    return {
      status: "not_found",
      confidence: Math.round((Number(ai.confidence || 0)) * 100),
      message: "No trusted product match found. Use Product Filter.",
      bestMatch: null,
      alternatives: []
    };
  }
  if (top.score >= 55) {
    return {
      status: "verified",
      confidence: Math.min(99, top.score),
      message: "Verified matching product found.",
      bestMatch: top,
      alternatives: scored.slice(1, 4)
    };
  }
  if (top.score >= 35 && second) {
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