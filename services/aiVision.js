
async function analyzeImageWithAI() {
  return {
    candidate: {
      brand: "",
      product_name: "",
      category: "",
      code: "",
      style: "",
      suspicious_elements: [],
      confidence: 0
    },
    raw_text: "AI disabled"
  };
}
module.exports = {
  analyzeImageWithAI
};
