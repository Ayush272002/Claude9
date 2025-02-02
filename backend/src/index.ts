import express, { Request, Response } from "express";
import cors from "cors";
import authController from "./controllers/authController";
import profileController from "./controllers/profileController";
import memegeneratorController from "./controllers/memegeneratorController";
import dotenv from "dotenv";
import authMiddleware from "./middleware/authMiddleware";

dotenv.config();
const CLOUD_PORT = process.env.PORT || 8000;
let startTime = 0;

const app = express();
app.use(express.json());

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.get("/", (_req: Request, res: Response) => {
  res.send("Server has been online for " + (Date.now() - startTime) + "ms");
});

// User-related routes
app.use("/api/v1/auth", authController);
app.use("/api/v1/profile", authMiddleware, profileController);
app.use("/api/v1/memes", authMiddleware, memegeneratorController);

app.listen(CLOUD_PORT, () => {
  console.log("Server is online and running on port " + CLOUD_PORT);
  startTime = Date.now();
});
