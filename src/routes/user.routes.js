import express from "express";
import {
  deleteUser,
  getUserData,
  updateUserData,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/getUserData", authenticateToken, getUserData);

router.post("/updateUserData", authenticateToken, updateUserData);
router.delete("/deleteUser", authenticateToken, deleteUser);

export default router;
