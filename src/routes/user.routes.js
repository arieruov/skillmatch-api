import express from "express";
import { getUserData } from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/getUserData", authenticateToken, getUserData);

export default router;
