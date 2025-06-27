import express from "express";
import {
  getAllOffers,
  getOffer,
  publishOffer,
} from "../controllers/job.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/publishOffer", authenticateToken, publishOffer);
router.get("/getAllOffers", authenticateToken, getAllOffers);
router.post("/getOffer", authenticateToken, getOffer);

export default router;
