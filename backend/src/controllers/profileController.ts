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

router.post("/insights", async (req: Request, res: Response) => {
  const { chatMessages, lifestyleAnswers, selectedEmotion } = req.body;

  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
  });


  const conversationContext = chatMessages
    .map((msg: { role: string, content: string }) => `${msg.role}: ${msg.content}`)
    .join('\n');

  const lifestyleContext = [
    `Exercise/Sports: ${lifestyleAnswers.find((q: { id: string, checked: boolean }) => q.id === 'exercise')?.checked ? 'Yes' : 'No'}`,
    `Social Interaction: ${lifestyleAnswers.find((q: { id: string, checked: boolean }) => q.id === 'friends')?.checked ? 'Yes' : 'No'}`,
    `Quality Sleep: ${lifestyleAnswers.find((q: { id: string, checked: boolean }) => q.id === 'sleep')?.checked ? 'Yes' : 'No'}`
  ].join(', ');


  try {
    let anthropicRes = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: `You are a mental health insights assistant. Provide brief, meaningful observations about the user's emotional state and lifestyle. Keep responses concise and natural, avoiding clinical language or explicit structure. Focus on one key insight and a gentle suggestion. Maintain professional distance and avoid personal pronouns.`,
      messages: [{
        role: "user",
        content: `Based on this information:

Current Emotion: ${selectedEmotion}
${conversationContext}
Lifestyle: ${lifestyleContext}

Provide a brief, natural insight about their emotional state and a gentle suggestion. Keep it to 2-3 sentences maximum.`
      }]
    });

    if (!anthropicRes.content || !anthropicRes.content[0] || !('text' in anthropicRes.content[0])) {
      throw new Error('Invalid response from Claude');
    }

    res.status(200).json({
      insights: anthropicRes.content[0].text
    });
  }
  catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An error occurred while generating insights' 
    });
  }
});

export default router;
