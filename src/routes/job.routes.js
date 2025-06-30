import express from "express";
import {
  getAllOffers,
  getAllSavedOffers,
  getOffer,
  publishOffer,
  saveOffer,
} from "../controllers/job.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/publishOffer", authenticateToken, publishOffer);
router.get("/getAllOffers", authenticateToken, getAllOffers);
router.post("/getOffer", authenticateToken, getOffer);
router.post("/saveOffer", authenticateToken, saveOffer);
router.get("/getAllSavedOffers", authenticateToken, getAllSavedOffers);

export default router;
