import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { Anthropic } from '@anthropic-ai/sdk';
import { TextBlock } from "@anthropic-ai/sdk/resources";

const prisma = new PrismaClient();

const router = Router();
const SECRET = process.env.JWT_SECRET || "default_secret";

router.get("/", async (req: Request, res: Response) => {
  const { userId } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      user_id: userId
    },
  });

  if (!user) {
    res.status(404).send("User not found");
    return;
  }

  res.status(200).json({
    user_id: user.user_id,
    email: user.email,
    opt_out_of_memes: user.opt_out_of_memes,
    utc_offset: user.utc_offset,
    daily_reminder_freq: user.daily_reminder_freq
  });
});

router.post("/thoughts", async (req: Request, res: Response) => {
  let { messages, emotion } = req.body;
  if (!messages) messages = [
    {"role": "assistant", "content": "I'm here to aid you and learn more about how you're feeling. How are you feeling today?"},
    {"role": "user", "content": emotion}
  ]

  if (messages.length > 6) {
    messages = [...messages, { "role": "user", "content": "Conclude the conversation with some closing advice." }]
  }

  const anthropic = new Anthropic();

  let anthropicRes = (await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages
  }));

  res.status(200).json({
    messages: [...messages, { "role": "assistant", "content": (anthropicRes.content[0] as TextBlock).text }]
  });
})






router.post("/checkin", async (req: Request, res: Response) => {
  const { userId, playedSport, metFriends, sleptWell, initMood, thoughts } = req.body;

  const checkIn = await prisma.checkIn.create({
    data: {
      user_id: userId,
      time: new Date(),
      played_sport: playedSport,
      met_friends: metFriends,
      slept_well: sleptWell,
      init_mood: initMood,
      overall_sentiment: "CALM",
      thoughts: "q and a and q and a",
      insights_actions: "maybe don't do the thing thats making you sad?",
      playlist: "playlistURL"
    }
  });

  res.status(201);
});

export default router;
