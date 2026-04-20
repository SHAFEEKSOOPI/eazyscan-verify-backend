const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const verifyRoute = require("./routes/verify");
const app = express();
app.use(cors({
   origin: "*"
}));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));
app.use("/api", verifyRoute);
app.get("/", (req, res) => {
  res.json({
    ok: true,
    app: "EazyScan Verify Backend",
    version: "1.0.0"
  });
});
const port = process.env.PORT || 3211;
app.listen(port, () => {
  console.log(`EazyScan Verify Backend running on http://localhost:${port}`);
});
