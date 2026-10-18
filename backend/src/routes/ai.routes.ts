import { Router } from "express";
import { z } from "zod";
import {
  generateAIContent,
  type AIContentType
} from "../services/ai.service";

const aiRouter = Router();

const contentSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().max(100).optional(),
  details: z.string().trim().max(2000).optional(),
  language: z.enum(["Hindi", "English", "Hinglish"]).default("English"),
  tone: z.string().trim().max(100).optional(),
  price: z.union([z.number(), z.string().max(50)]).optional(),
  stock: z.number().int().nonnegative().optional()
});

const contentTypes: AIContentType[] = [
  "description",
  "seo",
  "whatsapp",
  "instagram",
  "faq"
];

aiRouter.post("/:type", async (req, res) => {
  const type = req.params.type;

  if (!contentTypes.includes(type as AIContentType)) {
    return res.status(404).json({
      success: false,
      message: "Unsupported AI content type."
    });
  }

  const parsed = contentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid AI content input.",
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  try {
    const content = await generateAIContent(
      parsed.data,
      type as AIContentType
    );

    return res.status(200).json({
      success: true,
      data: {
        content,
        ...(type === "description" ? { description: content } : {})
      }
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "AI_SERVICE_UNAVAILABLE") {
        return res.status(503).json({
          success: false,
          message: "AI service unavailable. Check whether Ollama is running."
        });
      }

      if (
        error.message === "AI_MODEL_REQUEST_FAILED" ||
        error.message === "AI_EMPTY_RESPONSE"
      ) {
        return res.status(502).json({
          success: false,
          message: "AI could not generate content. Please try again."
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while generating content."
    });
  }
});

export default aiRouter;