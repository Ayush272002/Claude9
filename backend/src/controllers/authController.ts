import { Request, Response, Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = Router();
const SECRET = process.env.JWT_SECRET || "default_secret";

const generateToken = (userId: UUID): string => {
  if (!SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign({ userId }, SECRET, { expiresIn: "2h" });
};

router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Missing email or password");
    return;
  }

  // const user = prisma
  // const user = await Database.getInstance().authenticateUser(
  //   email,
  //   password,
  // );
  if (!user) {
    res.status(404).send("User not found");
    return;
  }

  // Store the token in the cookie
  res.cookie("token", generateToken(user.userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).send("Login successful");
});

/**
 * Register endpoint - Creates a new user in the database.
 */
router.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send("Missing username or password");
    return;
  }

  const user = await Database.getInstance().createUser(username, password);

  if (!user) {
    res.status(500).send("Failed to create user");
    return;
  }

  res.status(201).send("User created");
});

/**
 * Logout endpoint - Clears the token cookie.
 */
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).send("Logout successful");
});

/**
 * Profile endpoint - Demonstrates how the authMiddleware can be used to protect routes.
 */
router.get("/profile", authMiddleware, async (req: Request, res: Response) => {
  // This is jank but due to the way cookie-parser works it has to be done :(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId: string = (req as any).userId;

  // Retrieve user profile based on userId
  const user = await Database.getInstance().getUserById(userId);
  if (!user) {
    res.status(404).send("User not found");
    return;
  }

  res.status(200).json(user);
  return;
});

/**
 * Timetable subscription endpoint - Lists all timetables the user is subscribed to.
 */
router.get(
  "/timetables",
  authMiddleware,
  async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId: UUID = (req as any).userId;

    const timetables = await Database.getInstance().getTimetablesByUser(userId);
    if (!timetables) {
      res.status(404).send("No timetables found");
      return;
    }

    res.status(200).json(timetables);
  },
);

/**
 * Get the username of a user by their ID. Doesn't require authentication.
 * */
router.get("/username/:uuid", async (req: Request, res: Response) => {
  const user = await Database.getInstance().getUserById(req.params.uuid);

  if (!user) {
    res.status(404).send("User not found");
    return;
  }

  res.status(200).json(user.username);
});

export default router;
