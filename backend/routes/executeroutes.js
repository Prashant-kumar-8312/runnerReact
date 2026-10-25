
import express from "express";
import { executeC } from "../controllers/executeController.js";

const router = express.Router();

router.post("/c", executeC);

export default router;
