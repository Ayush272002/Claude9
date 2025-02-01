"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const SECRET = process.env.JWT_SECRET || "default_secret";
const generateToken = (userId) => {
    if (!SECRET) {
        throw new Error("JWT_SECRET is not set");
    }
    return jsonwebtoken_1.default.sign({ userId }, SECRET, { expiresIn: "2h" });
};
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
/**
 * Register endpoint - Creates a new user in the database.
 */
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send("Missing username or password");
        return;
    }
    const user = yield Database.getInstance().createUser(username, password);
    if (!user) {
        res.status(500).send("Failed to create user");
        return;
    }
    res.status(201).send("User created");
}));
/**
 * Logout endpoint - Clears the token cookie.
 */
router.post("/logout", (_req, res) => {
    res.clearCookie("token");
    res.status(200).send("Logout successful");
});
/**
 * Profile endpoint - Demonstrates how the authMiddleware can be used to protect routes.
 */
router.get("/profile", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This is jank but due to the way cookie-parser works it has to be done :(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = req.userId;
    // Retrieve user profile based on userId
    const user = yield Database.getInstance().getUserById(userId);
    if (!user) {
        res.status(404).send("User not found");
        return;
    }
    res.status(200).json(user);
    return;
}));
/**
 * Timetable subscription endpoint - Lists all timetables the user is subscribed to.
 */
router.get("/timetables", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = req.userId;
    const timetables = yield Database.getInstance().getTimetablesByUser(userId);
    if (!timetables) {
        res.status(404).send("No timetables found");
        return;
    }
    res.status(200).json(timetables);
}));
/**
 * Get the username of a user by their ID. Doesn't require authentication.
 * */
router.get("/username/:uuid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield Database.getInstance().getUserById(req.params.uuid);
    if (!user) {
        res.status(404).send("User not found");
        return;
    }
    res.status(200).json(user.username);
}));
exports.default = router;
