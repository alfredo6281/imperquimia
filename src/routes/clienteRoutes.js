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
router.patch("/cliente/:id", editCliente)

export default router;






/*import express from "express";
import bodyParser from "body-parser";

const router = express.Router();
router.use(bodyParser.json());

const dbConfig = {
  user: "imperuser2",
  password: "1234",
  server: "DESKTOP-5144HB2",
  database: "InventarioImper",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// 🧾 Obtener todos los clientes
router.get("/api/cliente", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT * FROM Cliente
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error obteniendo clientes:", error);
    res.status(500).json({ error: "Error obteniendo clientes" });
  }
});

export default router;
*/