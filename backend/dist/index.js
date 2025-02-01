"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const authController_1 = __importDefault(require("./controllers/authController"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const CLOUD_PORT = process.env.PORT || 8000;
let startTime = 0;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
app.get("/", (_req, res) => {
    res.send("Server has been online for " + (Date.now() - startTime) + "ms");
});
// User-related routes
app.use("/api/v1/auth", authController_1.default);
app.listen(CLOUD_PORT, () => {
    console.log("SSH Cloud is online and running on port " + CLOUD_PORT);
    startTime = Date.now();
    Database.getInstance(); // Trigger the Singleton instance creation
});
