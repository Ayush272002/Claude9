import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authController from "./controllers/authController";
import dotenv from "dotenv";

dotenv.config();
const CLOUD_PORT = process.env.PORT || 8000;
let startTime = 0;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/", (_req: Request, res: Response) => {
  res.send("Server has been online for " + (Date.now() - startTime) + "ms");
});

// User-related routes
app.use("/api/v1/auth", authController);

app.listen(CLOUD_PORT, () => {
  console.log("SSH Cloud is online and running on port " + CLOUD_PORT);
  startTime = Date.now();
  Database.getInstance(); // Trigger the Singleton instance creation
});
