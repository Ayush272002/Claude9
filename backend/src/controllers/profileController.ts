import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

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

export default router;
