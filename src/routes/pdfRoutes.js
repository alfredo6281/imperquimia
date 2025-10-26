import express from "express";
import { createPdf } from "../controllers/pdfController.js"


const router = express.Router();

router.post("/cotizacion/pdf", createPdf);
router.post("/servicio/pdf", createPdf);
router.post("/generate-pdf", createPdf)

export default router;