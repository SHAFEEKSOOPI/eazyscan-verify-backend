const fs = require("fs");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzeImageWithAI({ imagePath }) {
  try {
    const base64Image = fs.readFileSync(imagePath, { encoding: "base64" });

    const response = await client.responses.create({
  model: "gpt-4.1-mini",
  input: [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: `
You are an advanced product recognition AI.
Analyze this product label image carefully and extract:
- brand
- product_name
- category
- product_code
- style
- color
Return ONLY JSON.
`
        },
        {
          type: "input_image",
          image_url: `data:image/jpeg;base64,${base64Image}`
        }
      ]
    }
  ]
});


    const text = response.output_text?.trim();

    // 🔥 Safe JSON extraction (handles messy AI output)
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return {
        candidate: {
          brand: "",
          product_name: "",
          category: "",
          code: "",
          style: "",
          color: "",
          confidence: 0.3
        },
        raw_text: text
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      candidate: {
        brand: parsed.brand || "",
        product_name: parsed.product_name || "",
        category: parsed.category || "",
        code: parsed.product_code || "",
        style: parsed.style || "",
        color: parsed.color || "",
        confidence: 0.85
      },
      raw_text: text
    };

  } catch (err) {
    console.error("AI VISION ERROR:", err);

    return {
      candidate: {
        brand: "",
        product_name: "",
        category: "",
        code: "",
        style: "",
        color: "",
        confidence: 0
      },
      raw_text: "AI failed"
    };
  }
}

module.exports = {
  analyzeImageWithAI
};