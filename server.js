import express from "express";
import sql from "mssql";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de SQL Server
const dbConfig = {
    user: "imperuser",
    password: "1234",
    server: "DESKTOP-5144HB2", // o la IP del servidor
    database: "InventarioImperqui",
    options: {
        encrypt: false, // true si usas Azure
        trustServerCertificate: true
    }
};
// Crear pool de conexión
const pool = new sql.ConnectionPool(dbConfig);
await pool.connect();

// 📌 Obtener todos los productos
app.get("/producto", async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query("SELECT * FROM Producto");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 📌 Crear un nuevo producto
app.post("/producto", async (req, res) => {
  const { nombre, categoria, unidadMedida, Stock, precioUnitario, proveedor } = req.body;

  try {
    await pool.request()
      .input("nombre", sql.NVarChar(100), nombre)
      .input("categoria", sql.NVarChar(100), categoria)
      .input("unidadMedida", sql.NVarChar(50), unidadMedida)
      .input("Stock", sql.Int, Stock)
      .input("precioUnitario", sql.Decimal(10,2), precioUnitario)
      .input("proveedor", sql.NVarChar(50), proveedor)
      .query(`
        INSERT INTO Producto (nombre, categoria, unidadMedida, Stock, PrecioUnitario, proveedor)
        VALUES (@nombre, @categoria, @unidadMedida, @stock, @precioUnitario, @proveedor)
      `);

    res.status(201).json({ message: "Producto agregado correctamente" });
  } catch (err) {
    console.error("❌ Error al insertar producto:", err);
    res.status(500).json({ error: "Error al insertar producto" });
  }
});
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
app.listen(5000, () => console.log("✅ Servidor corriendo en http://localhost:5000"));
