const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { analyzeImageWithAI } = require("../services/aiVision");
const { lookupBarcode } = require("../services/barcodeLookup");
const { normalizeFilters, normalizeBarcode } = require("../services/normalize");
const { scoreCandidates, buildDecision } = require("../services/scoring");
const { prepareImageForAI } = require("../utils/imageTools");
const { searchWeb } = require("../services/webSearch");
const router = express.Router();
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".jpg");
    cb(null, `scan-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});
router.post("/verify", upload.single("image"), async (req, res) => {
  console.log("🔥 VERIFY API HIT");
  try {
    let imagePath = null;
    let preparedImage = null;
    // ✅ handle base64 image
    if (req.body.image_base64) {
      const base64Data = req.body.image_base64.replace(/^data:image\/jpeg;base64,/, "");
      const filePath = path.join(uploadDir, `base64-${Date.now()}.jpg`);
      fs.writeFileSync(filePath, base64Data, "base64");
      imagePath = filePath;
    }
    // ✅ handle file upload
    if (req.file?.path) {
      imagePath = req.file.path;
    }
    // ✅ prepare image for AI
    if (imagePath) {
      preparedImage = await prepareImageForAI(imagePath);
    }
    const rawBarcode = req.body.barcode || "";
    const rawQr = req.body.qr || "";
    const filters = normalizeFilters({
      brand: req.body.brand,
      product: req.body.product,
      code: req.body.code,
      style: req.body.style,
      category: req.body.category
    });
    const barcode = normalizeBarcode(rawBarcode || req.body.code || "");
    const qr = String(rawQr || "").trim();
    // 🔍 AI + Barcode parallel
    const [aiResult, barcodeResult] = await Promise.all([
      preparedImage
        ? analyzeImageWithAI({
            imagePath: preparedImage.localPath,
            barcode,
            qr,
            filters
          })
        : Promise.resolve(null),
      barcode
        ? lookupBarcode(barcode)
        : Promise.resolve({ found: false, candidates: [] })
    ]);
    const candidates = [];
    if (barcodeResult?.candidates?.length) {
      for (const item of barcodeResult.candidates) {
        candidates.push({
          source: "barcode_lookup",
          product_name: item.product_name || "",
          brand: item.brand || "",
          category: item.category || "",
          code: item.code || barcode,
          image_url: item.image_url || "",
          raw: item
        });
      }
    }

const { normalizeBrand } = require("../services/normalize");
if (aiResult?.candidate) {
  candidates.push({
    source: "ai_vision",
    product_name: aiResult.candidate.product_name || "",
    brand: normalizeBrand(aiResult.candidate.brand),
    category: aiResult.candidate.category || "",
    code: aiResult.candidate.code || barcode || "",
    image_url: "",
    raw: aiResult.candidate
  });
}
    // ✅ scoring first
    const scored = scoreCandidates({
      candidates,
      barcode,
      qr,
      filters,
      aiResult
    });
    // ✅ decision AFTER scoring
    const decision = buildDecision({
      scored,
      barcode,
      qr,
      filters,
      aiResult,
      barcodeResult
    });

    let webLinks = [];
	if (
  	decision.bestMatch ||
  	aiResult?.candidate?.product_name ||
  	barcode
	) {
  	webLinks = await searchWeb({
    	brand: decision.bestMatch?.brand || aiResult?.candidate?.brand || "",
    	product: [
 	aiResult?.candidate?.product_name,
  	aiResult?.candidate?.style,
  	barcode
	].filter(Boolean).join(" ")
   });
   }

    res.json({
      ok: true,
      status: decision.status,
      confidence: decision.confidence,
      message:
      decision.status === "not_found"
         ? "⚠️ Product not verified. Showing similar results from web."
         : decision.message,
      best_match: decision.bestMatch,
      alternatives: decision.alternatives,
      web_links: webLinks,
      extracted: {
        barcode,
        qr,
        filters,
        ai: aiResult || null
      }
    });
  } catch (error) {
  console.error("🔥 FULL ERROR:", error);
  res.status(500).json({
    ok: false,
    status: "error",
    message: error.message,
    stack: error.stack   // 🔥 VERY IMPORTANT
  });
}
});
module.exports = router;