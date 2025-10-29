import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getProductos, createProducto, updateStock, uploadImage, editProduct } from "../controllers/productoController.js";

const router = express.Router();
const __dirname = path.resolve();

const uploadDir = path.join(__dirname, "src/img/Productos");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const idProducto = req.body.idProducto || Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${idProducto}${ext}`);
  },
});

const upload = multer({ storage });

router.get("/producto", getProductos);
router.post("/producto", createProducto);
router.put("/producto/:id/aumentar-stock", (req, res) => updateStock(req, res, "aumentar"));
router.put("/producto/:id/disminuir-stock", (req, res) => updateStock(req, res, "disminuir"));
router.post("/producto/upload", upload.single("image"), uploadImage);
router.put("/producto/editar/:id", editProduct);

export default router;
