import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "default_secret";

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Authorization token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload & {
      userId: Number;
    };

    req.body.userId = decoded.userId;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};

export default authMiddleware;
