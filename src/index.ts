import morgan from "morgan";
import compression from "compression";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import questionRoutes from "./routes/question.routes";
import assessmentRoutes from "./routes/assessment.routes";
import historyRoutes from "./routes/history.routes";
import tipRoutes from "./routes/tip.routes";
import fileRoutes from "./routes/file.routes";
import adminRoutes from "./routes/admin.routes";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_PROD_URL,
].filter(Boolean) as string[];

console.log("=================================");
console.log("ENV CHECK");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", PORT);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("FRONTEND_PROD_URL:", process.env.FRONTEND_PROD_URL);
console.log("Allowed Origins:", allowedOrigins);
console.log("=================================");

app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(morgan("combined"));

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  cors({
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/assess", assessmentRoutes);
app.use("/api/results", historyRoutes);
app.use("/api/tips", tipRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/admin", adminRoutes);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  console.error("SERVER ERROR");
  console.error(err);
});
