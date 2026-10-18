
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "BazaarBrain API is healthy",
        timestamp: new Date().toISOString(),
    });
});

router.get("/db", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            success: true,
            message: "Database connection successful",
            database: "PostgreSQL",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Database health check failed:", error);

        res.status(503).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

export default router;
