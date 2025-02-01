import { Request, Response, Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const router = Router();
const SECRET = process.env.JWT_SECRET || "default_secret";

router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Missing email or password");
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      email
    },
  });

  if (!user) {
    res.status(404).send("User not found");
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).send("Invalid password");
    return;
  }

  const token = jwt.sign({ userId: user.user_id }, SECRET);
  res.json({ token });
});

router.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Missing username or password");
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (user) {
    res.status(409).send("User already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      utc_offset: 0,
    },
  });

  const token = jwt.sign({ userId: newUser.user_id }, SECRET);
  res.status(201).json({ token });
});

export default router;
