import express from "express";
import { createPdf, getDetallesCotizacion } from "../controllers/cotizacionController.js";
import { getCotizacion, createCotizacion } from "../controllers/cotizacionController.js";

const router = express.Router();

router.post("/cotizacion/pdf", createPdf);
router.post("/servicio/pdf", createPdf);
router.get("/cotizacion", getCotizacion);
router.get("/cotizacion/detalle/:id", getDetallesCotizacion);

export default router;