import express from "express";

import {
  getFiles,
  createFile,
  updateFile,
  deleteFile
} from "../controllers/fileController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get(
  "/project/:projectId",
  getFiles
);

router.post(
  "/project/:projectId",
  createFile
);

router.put(
  "/:id",
  updateFile
);

router.delete(
  "/:id",
  deleteFile
);

export default router;