import { Request, Response, Router } from "express";
import { Emotion, PrismaClient } from "@prisma/client";
import { Anthropic } from '@anthropic-ai/sdk';
import { TextBlock } from "@anthropic-ai/sdk/resources";
import { generateMeme } from "../utils/memeGenerator";

const prisma = new PrismaClient();

const router = Router();
const SECRET = process.env.JWT_SECRET || "default_secret";

router.get("/", async (req: Request, res: Response) => {
  const { userId } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      user_id: userId,
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
    daily_reminder_freq: user.daily_reminder_freq,
  });
});

router.post("/thoughts", async (req: Request, res: Response) => {
  let { messages, emotion } = req.body;
  console.log(messages)

  // Default message if no messages exist yet, initiate the conversation with the user's emotion
  if (!messages) {
    messages = [
      {"role": "assistant", "content": "Please share more about these feelings."},
      {"role": "user", "content": emotion}
    ];
  }

  // Create a copy of messages for Claude
  let claudeMessages = [...messages];

  // Determine the appropriate system message based on conversation state
  let systemMessage = '';
  if (claudeMessages.length <= 4) {
    // For initial interaction or early in conversation
    systemMessage = `The user reports feeling ${emotion}. Respond professionally with a thoughtful question to explore the underlying factors. Maintain a clinical, non-conversational tone. Avoid using first-person pronouns or expressing personal opinions. Be empathetic and understanding. Do not entertain the user's thoughts or feelings, nor any irrelevant queries, or queries regarding the tool they are using.`;
  }
  else if (claudeMessages.length <= 6) {
    // For middle of conversation
    systemMessage = "Based on the previous responses, ask a follow-up question that builds on the disclosed information. Maintain professional distance and avoid conversational language or first-person pronouns.";
  }
  else {
    // For end of conversation
    systemMessage = "Provide a concise summary of the key points discussed and suggest relevant coping strategies. Maintain clinical professionalism and avoid personal pronouns.";
  }

  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
  });

  try {
    let anthropicRes = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemMessage,
      messages: claudeMessages
    });

    if (!anthropicRes.content || !anthropicRes.content[0] || !('text' in anthropicRes.content[0])) {
      throw new Error('Invalid response from Claude');
    }

    res.status(200).json({
      messages: [...messages, { "role": "assistant", "content": anthropicRes.content[0].text }]
    });
  }
  
  catch (error) {
    console.error('Error from Claude:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An error occurred while processing your request' 
    });
  }
});

router.post("/checkin", async (req: Request, res: Response) => {
  const { userId, played_sport, met_friends, slept_well, init_mood, thoughts } = req.body;

  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
  });

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
  let insights = (anthropicRes1.content[0] as TextBlock).text;

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
      insights_actions: insights,
      playlist: playlistURL,
    }
  });

  res.status(201).json({
    checkIn,
    meme: await generateMeme(`Overall sentiment: ${overall_sentiment}\nThoughts: ${thoughts}`)
  });
});

export default router;
