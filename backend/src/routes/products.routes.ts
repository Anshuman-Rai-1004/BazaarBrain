
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const router = Router();

const productSchema = z.object({
    name: z.string().trim().min(1).max(200),
    sku: z.string().trim().min(1).max(100),
    description: z.string().trim().max(5000).nullable().optional(),
    price: z.coerce.number().positive().finite(),
    stock: z.number().int().min(0).default(0),
    status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
    categoryId: z.string().nullable().optional(),
});

const updateProductSchema = productSchema.partial();

// GET /api/products
router.get("/", async (_req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("Fetch products failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id as string },
            include: { category: true },
        });

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }

        res.json({ success: true, data: product });
    } catch (error) {
        console.error("Fetch product failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
        });
    }
});

// POST /api/products

router.post("/", async (req, res) => {
    const parsed = productSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            success: false,
            message: "Invalid product data",
            errors: parsed.error.flatten(),
        });
        return;
    }

    try {
        const { categoryId, description, ...productData } = parsed.data;

        const product = await prisma.product.create({
            data: {
                name: productData.name,
                sku: productData.sku,
                price: productData.price,
                stock: productData.stock,
                status: productData.status,
                ...(description != null ? { description } : {}),
                ...(categoryId != null ? { categoryId } : {}),
            },
        });

        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            res.status(409).json({
                success: false,
                message: "A product with this SKU already exists",
            });
            return;
        }

        console.error("Create product failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
});

// PATCH /api/products/:id


router.patch("/:id", async (req, res) => {
    const parsed = updateProductSchema.safeParse(req.body);

    if (
        !parsed.success ||
        Object.keys(req.body ?? {}).length === 0
    ) {
        res.status(400).json({
            success: false,
            message: "Invalid or empty product update",
            errors: parsed.success
                ? undefined
                : parsed.error.flatten(),
        });
        return;
    }

    try {
        const {
            categoryId,
            description,
            ...productData
        } = parsed.data;

        // Only include fields that were actually provided.
        const data = {
            ...(productData.name !== undefined
                ? { name: productData.name }
                : {}),
            ...(productData.sku !== undefined
                ? { sku: productData.sku }
                : {}),
            ...(productData.price !== undefined
                ? { price: productData.price }
                : {}),
            ...(productData.stock !== undefined
                ? { stock: productData.stock }
                : {}),
            ...(productData.status !== undefined
                ? { status: productData.status }
                : {}),
            ...(description !== undefined
                ? { description }
                : {}),
            ...(categoryId !== undefined
                ? { categoryId }
                : {}),
        };

        const product = await prisma.product.update({
            where: {
                id: req.params.id as string,
            },
            data,
        });

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2025"
        ) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            res.status(409).json({
                success: false,
                message: "A product with this SKU already exists",
            });
            return;
        }

        console.error("Update product failed:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update product",
        });
    }
});



// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: req.params.id as string },
        });

        res.json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2025"
        ) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2003"
        ) {
            res.status(409).json({
                success: false,
                message: "Product is referenced by an order and cannot be deleted",
            });
            return;
        }

        console.error("Delete product failed:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
        });
    }
});

export default router;
