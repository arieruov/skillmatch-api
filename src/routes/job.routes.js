import express from "express";
import {
  getAllOffers,
  getAllSavedOffers,
  getOffer,
  publishOffer,
  saveOffer,
  editOffer,
  deleteOffer,
  getOffersPublishedByUser,
} from "../controllers/job.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/getAllOffers", authenticateToken, getAllOffers);
router.get("/getAllSavedOffers", authenticateToken, getAllSavedOffers);
router.get(
  "/getOffersPublishedByUser",
  authenticateToken,
  getOffersPublishedByUser
);

router.post("/getOffer", authenticateToken, getOffer);
router.post("/publishOffer", authenticateToken, publishOffer);
router.post("/saveOffer", authenticateToken, saveOffer);
router.post("/editOffer", authenticateToken, editOffer);
router.post("/deleteOffer", authenticateToken, deleteOffer);

export default router;
