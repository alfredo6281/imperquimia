import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getMovimientos,
} from "../controllers/movimientoController.js";

const router = express.Router();

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const idMovimiento = req.body.idCliente || Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${idProducto}${ext}`);
  },
});

router.get("/movimiento", getMovimientos);

export default router;