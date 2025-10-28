import express from "express";
import {
  deleteCliente,
  getCliente,
  createCliente,
  editCliente,
  getDetalleCliente,
} from "../controllers/clienteController.js";

const router = express.Router();

router.get("/cliente", getCliente);
router.get("/cliente/detalle/:id", getDetalleCliente);
router.post("/cliente", createCliente);
router.delete("/cliente/:id", deleteCliente);
router.put("/cliente/:id", editCliente);

export default router;