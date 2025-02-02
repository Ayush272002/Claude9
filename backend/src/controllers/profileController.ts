import { Request, Response, Router } from "express";
import { Emotion, PrismaClient } from "@prisma/client";
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
  const { userId, played_sport, met_friends, slept_well, init_mood, thoughts } = req.body;

  const anthropic = new Anthropic();

  let anthropicRes0 = (await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {"role": "user", "content": `
Here's some information about a user:

Played sport today? ${played_sport ? "Yes" : "No"}
Met friends today? ${met_friends ? "Yes" : "No"}
Slept well today? ${slept_well ? "Yes" : "No"}
Initial mood: ${init_mood}

Dialogue with assistant:

${thoughts}

Using the above information, generate an emotion from this list to summarize the user's feelings:
  // Red (High Energy, Unpleasant)
  ENRAGED
  PANICKED
  STRESSED
  FRUSTRATED
  ANGRY
  ANXIOUS
  WORRIED
  IRRITATED
  ANNOYED
  DISGUSTED

  // Blue (Low Energy, Unpleasant)
  DISAPPOINTED
  SAD
  LONELY
  HOPELESS
  EXHAUSTED
  DEPRESSED
  BORED
  DRAINED

  // Yellow (High Energy, Pleasant)
  SURPRISED
  UPBEAT
  FESTIVE
  EXCITED
  OPTIMISTIC
  HAPPY
  JOYFUL
  HOPEFUL
  BLISSFUL

  // Green (Low Energy, Pleasant)
  AT_EASE
  CONTENT
  LOVING
  GRATEFUL
  CALM
  RELAXED
  RESTFUL
  PEACEFUL
  SERENE
Answer only with the emotion, in the following format: WORD
  `}
    ]
  }));

  let anthropicRes1 = (await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {"role": "user", "content": `
Here's some information about a user:

Played sport today? ${played_sport ? "Yes" : "No"}
Met friends today? ${met_friends ? "Yes" : "No"}
Slept well today? ${slept_well ? "Yes" : "No"}
Initial mood: ${init_mood}

Dialogue with assistant:

${thoughts}

Using the above information, generate a short reflective sentence for the user
to promote personal growth and development.
  `}
    ]
  }));

  let overall_sentiment = (anthropicRes0.content[0] as TextBlock).text as Emotion;
  let actions = (anthropicRes1.content[0] as TextBlock).text;

  // [TODO] compute this
  let playlistURL = "tbd";

  const checkIn = await prisma.checkIn.create({
    data: {
      user_id: userId,
      time: new Date(),
      played_sport,
      met_friends,
      slept_well,
      init_mood: init_mood as Emotion,
      overall_sentiment: overall_sentiment as Emotion,
      thoughts: thoughts,
      insights_actions: actions,
      playlist: playlistURL
    }
  });

  res.status(201).json({
    checkIn
  });
});

export default router;
