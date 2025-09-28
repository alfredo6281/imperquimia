import express from "express";
import sql from "mssql";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Configuración de SQL Server
const dbConfig = {
  user: "imperuser",
  password: "1234",
  server: "DESKTOP-5144HB2", // o la IP de tu SQL
  database: "InventarioImperqui",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Carpeta donde se guardarán las imágenes
const uploadDir = path.join(__dirname, "src/img/Productos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const idProducto = req.body.idProducto || Date.now();//fallback por si llega vacio
    const ext = path.extname(file.originalname);
    cb(null, `${idProducto}${ext}`);
  },
});
const upload = multer({ storage });

// Servir imágenes estáticas
app.use("/img/Productos", express.static(path.join(__dirname, "src/img/Productos")));

// Crear pool de conexión
const pool = new sql.ConnectionPool(dbConfig);
await pool.connect();

// 📌 Obtener todos los productos
app.get("/producto", async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM Producto");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 📌 Crear un nuevo producto
app.post("/producto", async (req, res) => {
  const {
    nombre,
    categoria,
    unidadMedida,
    Stock,
    stockMinimo,
    precioUnitario,
    proveedor,
    dimensiones,
    peso,
    URLImagen,
  } = req.body;

  try {
    const result = await pool
      .request()
      .input("nombre", sql.NVarChar(100), nombre)
      .input("categoria", sql.NVarChar(100), categoria)
      .input("unidadMedida", sql.NVarChar(50), unidadMedida)
      .input("Stock", sql.Int, Stock)
      .input("stockMinimo", sql.Int, stockMinimo)
      .input("dimensiones", sql.NVarChar(20), dimensiones)
      .input("precioUnitario", sql.Decimal(10, 2), precioUnitario)
      .input("peso", sql.Decimal(10, 2), peso)
      .input("proveedor", sql.NVarChar(50), proveedor)
      .input("URLImagen", sql.NVarChar(500), URLImagen)
      .query(`
        INSERT INTO Producto (nombre, categoria, unidadMedida, Stock, stockMinimo, dimensiones, PrecioUnitario, peso, proveedor, URLImagen)
        OUTPUT INSERTED.idProducto
        VALUES (@nombre, @categoria, @unidadMedida, @Stock, @stockMinimo, @dimensiones, @precioUnitario, @peso, @proveedor, @URLImagen)
      `);

    const idProducto = result.recordset[0].idProducto;
    res.status(201).json({ message: "Producto agregado correctamente", idProducto });
  } catch (err) {
    console.error("❌ Error al insertar producto:", err);
    res.status(500).json({ error: "Error al insertar producto" });
  }
});

// 📌 Subir imagen y actualizar la ruta en la BD
app.post("/producto/upload", upload.single("image"), async (req, res) => {
  const idProducto = req.body.idProducto;
  const ext = path.extname(req.file.originalname);
  const newFilename = `${idProducto}${ext}`;
  const newPath = path.join(uploadDir, newFilename);

  // Renombrar el archivo manualmente
  fs.renameSync(req.file.path, newPath);
  const imagePath = `/src/img/Productos/${newFilename}`;
  // 👀 Verifica qué está llegando
  console.log("📦 Datos recibidos en upload:");
  console.log("➡️ idProducto:", idProducto);
   console.log("📦 Imagen renombrada:", newFilename);
  try {
    await pool
      .request()
      .input("idProducto", sql.Int, idProducto)
      .input("URLImagen", sql.NVarChar(200), imagePath)
      .query("UPDATE Producto SET URLImagen = @URLImagen WHERE idProducto = @idProducto");

    res.json({ success: true, URLImagen: imagePath });
  } catch (err) {
    console.error("❌ Error al actualizar imagen:", err);
    res.status(500).json({ error: "Error al actualizar imagen" });
  }
});
app.listen(5000, () => console.log("✅ Servidor corriendo en http://localhost:5000"));
/*
// 📌 Actualizar producto
app.put("/productos/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, cantidad, id_unidad } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input("id", sql.Int, id)
            .input("nombre", sql.NVarChar, nombre)
            .input("cantidad", sql.Decimal(10,2), cantidad)
            .input("id_unidad", sql.Int, id_unidad)
            .query("UPDATE Productos SET nombre=@nombre, cantidad=@cantidad, id_unidad=@id_unidad WHERE id_producto=@id");
        res.send("Producto actualizado");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 📌 Eliminar producto
app.delete("/productos/:id", async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM Productos WHERE id_producto=@id");
        res.send("Producto eliminado");
    } catch (err) {
        res.status(500).send(err.message);
    }
});
*/

