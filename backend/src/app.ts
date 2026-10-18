
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRoutes from "./routes/health.routes";
import productsRoutes from "./routes/products.routes";
import aiRoutes from "./routes/ai.routes";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    name: "BazaarBrain API",
    status: "running",
    version: "1.0.0",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/ai", aiRoutes);

export default app;

