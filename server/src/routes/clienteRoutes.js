import express from "express";
import {
  deleteCliente,
  getCliente,
  createCliente,
  editCliente,
} from "../controllers/clienteController.js";

const router = express.Router();

router.get("/cliente", getCliente);
router.post("/cliente", createCliente)
router.delete("/cliente/:id", deleteCliente);
router.put("/cliente/:id", editCliente)

export default router;