// server.js
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

const PORT = 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`✅ Servidor corriendo en  http://localhost:${PORT}`));
};

startServer();
/*
import express from "express";
import sql from "mssql";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";
import cotizacionRoutes from "./src/routes/cotizacionRoutes.js";
import productoRoutes from "./src/routes/productoRoutes.js";
import customers from "./src/routes/customers.js";
import pdfRouter from "./src/routes/cotizacionRoutes.js"; // Ajusta la ruta según tu estructura
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use("/api", productoRoutes);
app.use("/api", cotizacionRoutes);
app.use("/api", customers);
// Configuración de SQL Server
const dbConfig = {
  user: "imperuser2",
  password: "1234",
  server: "DESKTOP-5144HB2", // o la IP de tu SQL
  database: "InventarioImper",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
// Montar el router de cotizaciones
app.use(pdfRouter);
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
// 📌 Obtener todos los clientes
app.get("/cliente", async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM Cliente");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
// 📌 Crear un nuevo producto
app.post("/producto", async (req, res) => {
  const {
    idProducto,
    nombre,
    categoria,
    tipo,
    unidad,
    unidadMedida,
    color,
    precioUnitario,
    stock,
    stockMinimo,
    descripcion,
    URLImagen,
  } = req.body;

  try {
    const result = await pool
      .request()
      .input("idProducto", sql.Int, idProducto)
      .input("nombre", sql.NVarChar(50), nombre)
      .input("categoria", sql.NVarChar(24), categoria)
      .input("tipo", sql.NVarChar(10), tipo)
      .input("unidad", sql.Int, unidad)
      .input("unidadMedida", sql.NVarChar(10), unidadMedida)
      .input("color", sql.NVarChar(15), color)
      .input("precioUnitario", sql.Decimal(10, 2), precioUnitario)
      .input("stock", sql.Int, stock)
      .input("stockMinimo", sql.Int, stockMinimo)
      .input("descripcion", sql.NVarChar(100), descripcion)
      .input("URLImagen", sql.NVarChar(100), URLImagen)
      .query(`
        INSERT INTO Producto (idProducto, nombre, categoria, tipo, unidad, unidadMedida, color, precioUnitario, stock, stockMinimo, descripcion, URLImagen)
        
        VALUES (@idProducto, @nombre, @categoria, @tipo, @unidad, @unidadMedida, @color, @precioUnitario, @stock, @stockMinimo, @descripcion, @URLImagen)
      `);
    //No se usa porque el codigo se pone manual, se usa la siguiente linea cuando el id se pone automatico
    //const idProducto = result.recordset[0].idProducto;
    res.status(201).json({ message: "Producto agregado correctamente", idProducto });
  } catch (err) {
    console.error("❌ Error al insertar producto:", err, "producto:",idProducto);
    res.status(500).json({ error: "Error al insertar producto" });
  }
});

// 📌 Subir imagen y actualizar la ruta en la BD (conversión a WebP + resize 1:1)
app.post("/producto/upload", upload.single("image"), async (req, res) => {
  const idProducto = req.body.idProducto;

  // Nombre final en WebP
  const newFilename = `${idProducto}.webp`;
  const newPath = path.join(uploadDir, newFilename);

  try {
    // Redimensionar a 1:1 y convertir a WebP
    await sharp(req.file.path)
      .resize(500, 500, { // 👈 tamaño cuadrado (ajústalo: 300x300, 500x500, etc.)
        fit: "cover",      // recorta al centro si no es cuadrada
        position: "centre" // asegura que el recorte se haga centrado
      })
      .webp({ quality: 80 }) // 👈 convierte a WebP
      .toFile(newPath);

    // Eliminar el archivo original subido por multer
    fs.unlinkSync(req.file.path);

    // Ruta pública que se guarda en la BD
    const imagePath = `/src/img/Productos/${newFilename}`;

    // Actualizar en BD
    await pool
      .request()
      .input("idProducto", sql.Int, idProducto)
      .input("URLImagen", sql.NVarChar(200), imagePath)
      .query(
        "UPDATE Producto SET URLImagen = @URLImagen WHERE idProducto = @idProducto"
      );

    res.json({ success: true, URLImagen: imagePath });
  } catch (err) {
    console.error("❌ Error al procesar imagen:", err);
    res.status(500).json({ error: "Error al procesar imagen" });
  }
});

// Endpoint para obtener productos
/*app.get("/producto", async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query(`
      SELECT 
        idProducto, 
        nombre, 
        stock, 
        categoria, 
        URLimagen
      FROM Producto
    `);

    res.json(result.recordset); // Devuelve array con los productos
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener productos");
  }
});
// 📌 Aumentar stock de un producto
app.put("/producto/:id/aumentar-stock", async (req, res) => {
  const { id } = req.params; 
  const { cantidad } = req.body; 

  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
  }

  try {
    await pool
      .request()
      .input("idProducto", sql.Int, id)
      .input("cantidad", sql.Int, cantidad)
      .query(`
        UPDATE Producto 
        SET stock = stock + @cantidad 
        WHERE idProducto = @idProducto
      `);

    res.json({ success: true, message: `Stock de producto ${id} aumentado en ${cantidad}` });
  } catch (err) {
    console.error("❌ Error al actualizar stock:", err);
    res.status(500).json({ error: "Error al actualizar stock" });
  }
});

// 📌 Reducir stock de un producto
app.put("/producto/:id/disminuir-stock", async (req, res) => {
  const { id } = req.params; 
  const { cantidad } = req.body; 

  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
  }

  try {
    await pool
      .request()
      .input("idProducto", sql.Int, id)
      .input("cantidad", sql.Int, cantidad)
      .query(`
        UPDATE Producto 
        SET stock = stock - @cantidad 
        WHERE idProducto = @idProducto
      `);

    res.json({ success: true, message: `Stock de producto ${id} reducido en ${cantidad}` });
  } catch (err) {
    console.error("❌ Error al actualizar stock:", err);
    res.status(500).json({ error: "Error al actualizar stock" });
  }
});

// 📌 Obtener el Historial de Movimientos
app.get("/movimiento", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        m.idMovimiento,
        m.tipo,
        m.fecha,
        p.nombre AS nombre,
        m.cantidad,
        u.usuario AS userName
      FROM movimiento m
      INNER JOIN Producto p ON m.idProducto = p.idProducto
      INNER JOIN Usuario u ON m.idUsuario = u.idUsuario
      ORDER BY m.fecha DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error en /movimiento:", err);
    res.status(500).send(err.message);
  }
});
app.listen(5000, () => console.log("✅ Servidor corriendo en http://localhost:5000"));

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

