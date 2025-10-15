import express from "express";
import { createPdf } from "../controllers/cotizacionController.js";

const router = express.Router();

router.post("/cotizacion/pdf", createPdf);

export default router;