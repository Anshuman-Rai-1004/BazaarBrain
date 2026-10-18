const OLLAMA_URL =
  process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";

const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen3:4b";

export type AIContentInput = {
  name: string;
  category?: string | undefined;
  details?: string | undefined;
  language: "Hindi" | "English" | "Hinglish";
  tone?: string | undefined;
  price?: number | string | undefined;
  stock?: number | undefined;
};

export type AIContentType =
  | "description"
  | "seo"
  | "whatsapp"
  | "instagram"
  | "faq";

const instructions: Record<AIContentType, string> = {
  description:
    "Write a concise product description for an online shop.",
  seo:
    "Create an SEO title and meta description. Label them SEO Title and Meta Description.",
  whatsapp:
    "Write a concise WhatsApp promotional message with an appropriate call to action. Do not invent discounts or offers.",
  instagram:
    "Write an engaging Instagram caption with relevant hashtags. Do not invent product features or offers.",
  faq:
    "Write 4 useful product FAQs with answers. Only use facts supplied in the input; say when a detail is not provided."
};

export async function generateAIContent(
  input: AIContentInput,
  type: AIContentType
): Promise<string> {
  const prompt = `
Task: ${instructions[type]}

Product: ${input.name}
Category: ${input.category || "Not provided"}
Details: ${input.details || "Not provided"}
Price: ${input.price ?? "Not provided"}
Stock: ${input.stock ?? "Not provided"}
Requested language: ${input.language}
Tone: ${input.tone || "Professional"}

STRICT LANGUAGE RULES — FOLLOW EXACTLY:
- If Requested language is English: write entirely in natural English.
- If Requested language is Hindi: write entirely in Hindi using Devanagari script (हिंदी लिपि). Do not write Hindi in English/Roman letters. Common brand names and technical terms may remain in English when necessary.
- If Requested language is Hinglish: write conversational Hindi using English/Roman letters. Mix natural Hindi and English as people commonly do in India. Do NOT use Devanagari script. Do NOT write entirely in English.
- The requested language applies to every part of the output, including headings, calls to action, FAQs, and labels.
- Before responding, check that the output follows the requested language and script. Rewrite it if it does not.
- Output the final requested content only. Never include reasoning, analysis, internal thoughts, or explanations.
- Use only supplied product facts. Do not invent features, discounts, certifications, or offers.
- Keep the response concise and ready to publish.
`;

  let response: Response;

  try {
    response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        think: false,
        options: {
          num_predict: 400
        }
      }),
      signal: AbortSignal.timeout(120000)
    });
  } catch {
    throw new Error("AI_SERVICE_UNAVAILABLE");
  }

  if (!response.ok) {
    throw new Error("AI_MODEL_REQUEST_FAILED");
  }

  const result = await response.json() as {
    message?: { content?: string };
  };

  const content = result.message?.content?.trim();

  if (!content) {
    throw new Error("AI_EMPTY_RESPONSE");
  }

  return content;
}

export async function generateProductDescription(
  input: AIContentInput
): Promise<string> {
  return generateAIContent(input, "description");
}