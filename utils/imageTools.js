const sharp = require("sharp");
const path = require("path");
async function prepareImageForAI(inputPath) {
  const outputPath = inputPath.replace(/\.(jpg|jpeg|png|webp)$/i, "") + "-ai.jpg";
  await sharp(inputPath)
    .rotate()
    .resize({ width: 1280, withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toFile(outputPath);
  return {
    localPath: outputPath,
    mimeType: "image/jpeg"
  };
}
module.exports = {
  prepareImageForAI
};
