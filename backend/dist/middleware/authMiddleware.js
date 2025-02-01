"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || "default_secret";
const authMiddleware = (req, res, next) => {
    const token = req.cookies ? req.cookies.token : undefined;
    if (!token) {
        res.status(401).json({ message: "Authorization token missing" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        // This is jank but due to the way cookie-parser works it has to be done :(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.userId = decoded.userId;
        next();
    }
    catch (_a) {
        res.status(403).json({ message: "Invalid or expired token" });
        return;
    }
};
exports.default = authMiddleware;
