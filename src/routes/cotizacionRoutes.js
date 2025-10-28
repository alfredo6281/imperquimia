import express from "express";
import {
  getCotizacion, getDetallesCotizacion, getCotizacionManoObra, createCotizacionManoObra ,crearCotizacion,
  createDetalleCotizacion, createDetalleCotizacionBatch, createCotizacionConDetalles
} from "../controllers/cotizacionController.js";

const router = express.Router();

// cabeceras / listados
router.get("/cotizacion", getCotizacion);
router.get("/cotizacion/detalle/:id", getDetallesCotizacion);
router.get("/cotizacion/mano/:id", getCotizacionManoObra);
router.post("/cotizacion/crear/manoObra", createCotizacionManoObra);

// crear cotizacion (cabecera + detalles en una sola petición)
router.post("/cotizacion/crear", crearCotizacion);

// alternativa: crear cotizacion + detalles con endpoint específico
// (si quieres un endpoint con nombre distinto)
router.post("/cotizacion/con-detalles", createCotizacionConDetalles);

// endpoints para detalles sueltos (si los necesitas)
router.post("/detalleCotizacion", createDetalleCotizacion);
router.post("/detalleCotizacion/batch", createDetalleCotizacionBatch);

export default router;
