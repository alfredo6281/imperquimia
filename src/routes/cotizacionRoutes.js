import express from "express";
import { getCotizacion, getDetallesCotizacion, getCotizacionManoObra } from "../controllers/cotizacionController.js";

const router = express.Router();

router.get("/cotizacion", getCotizacion);
router.get("/cotizacion/detalle/:id", getDetallesCotizacion);
router.get("/cotizacion/mano/:id", getCotizacionManoObra);

export default router;