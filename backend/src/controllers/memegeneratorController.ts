import { Request, Response, Router } from "express";
import { topics } from "../utils/topics";
import { generateMeme } from "../utils/memeGenerator";

// Type definitions
interface MemeResponse {
  id: number;
  imageUrl: string;
  caption: string;
}

const router = Router();

router.post("/generate", async (req: Request, res: Response) => {
  try {
    if (!process.env.CLAUDE_API_KEY) {
      res.status(500).json({ error: "API key not configured" });
      return;
    }

    const topic = topics[Math.floor(Math.random() * topics.length)];

    // @ts-ignore
    const memeUrl = await generateMeme(topic);

    if (!memeUrl || !memeUrl.startsWith("https://api.memegen.link")) {
      throw new Error("Invalid meme response from Claude.");
    }

    res.json({ imageUrl: memeUrl });
  } catch (error) {
    console.error("Error generating meme:", error);
    res.status(500).json({
      error: "Failed to generate meme",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
