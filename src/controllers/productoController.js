import { pool, sql } from "../config/db.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();

export const getProductos = async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM Producto");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
export const createProducto = async (req, res) => {
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
    console.error("❌ Error al insertar producto:", err, "producto:", idProducto);
    res.status(500).json({ error: "Error al insertar producto" });
  }
};


export const updateStock = async (req, res, tipo) => {
  const { id } = req.params;
  const { cantidad } = req.body;

  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
  }

  const operacion = tipo === "aumentar" ? "+" : "-";

  try {
    await pool
      .request()
      .input("idProducto", sql.Int, id)
      .input("cantidad", sql.Int, cantidad)
      .query(`
        UPDATE Producto 
        SET stock = stock ${operacion} @cantidad 
        WHERE idProducto = @idProducto
      `);

    res.json({ success: true, message: `Stock de producto ${id} ${tipo} en ${cantidad}` });
  } catch (err) {
    console.error("❌ Error al actualizar stock:", err);
    res.status(500).json({ error: "Error al actualizar stock" });
  }
};

export const uploadImage = async (req, res) => {
  const idProducto = req.body.idProducto;
  const uploadDir = path.join(__dirname, "src/img/Productos");
  const newFilename = `${idProducto}.webp`;
  const newPath = path.join(uploadDir, newFilename);

  try {
    await sharp(req.file.path)
      .resize(500, 500, { fit: "cover", position: "centre" })
      .webp({ quality: 80 })
      .toFile(newPath);

    fs.unlinkSync(req.file.path);

    const imagePath = `/src/img/Productos/${newFilename}`;

    await pool
      .request()
      .input("idProducto", sql.Int, idProducto)
      .input("URLImagen", sql.NVarChar(200), imagePath)
      .query("UPDATE Producto SET URLImagen = @URLImagen WHERE idProducto = @idProducto");

    res.json({ success: true, URLImagen: imagePath });
  } catch (err) {
    console.error("❌ Error al procesar imagen:", err);
    res.status(500).json({ error: "Error al procesar imagen" });
  }
};

export const editProduct = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Falta id del producto en la ruta" });
  }

  // Campos que esperamos en body (todos opcionales — permitimos actualizaciones parciales)
  const {
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
  } = req.body ?? {};

  try {
    // Convertir numéricos si vienen (si no vienen => null para que ISNULL los ignore)
    const unidadVal = unidad !== undefined && unidad !== "" ? parseInt(unidad, 10) : null;
    const precioVal = precioUnitario !== undefined && precioUnitario !== "" ? parseFloat(precioUnitario) : null;
    const stockVal = stock !== undefined && stock !== "" ? parseInt(stock, 10) : null;
    const stockMinVal = stockMinimo !== undefined && stockMinimo !== "" ? parseInt(stockMinimo, 10) : null;

    const result = await pool
      .request()
      .input("idProducto", sql.Int, id)
      .input("nombre", sql.NVarChar(50), nombre ?? null)
      .input("categoria", sql.NVarChar(24), categoria ?? null)
      .input("tipo", sql.NVarChar(10), tipo ?? null)
      .input("unidad", sql.Int, unidadVal)
      .input("unidadMedida", sql.NVarChar(10), unidadMedida ?? null)
      .input("color", sql.NVarChar(15), color ?? null)
      .input("precioUnitario", sql.Decimal(10, 2), precioVal)
      .input("stock", sql.Int, stockVal)
      .input("stockMinimo", sql.Int, stockMinVal)
      .input("descripcion", sql.NVarChar(500), descripcion ?? null)
      .input("URLImagen", sql.NVarChar(200), URLImagen ?? null)
      .query(`
        UPDATE Producto
        SET
          nombre = @nombre,
          categoria = @categoria,
          tipo = @tipo,
          unidad = @unidad,
          unidadMedida = @unidadMedida,
          color = @color,
          precioUnitario = @precioUnitario,
          stock = @stock,
          stockMinimo = @stockMinimo,
          descripcion = @descripcion,
          URLImagen = @URLImagen
        WHERE idProducto = @idProducto
      `);

    // verificar si se afectó alguna fila
    const rowsAffected = result.rowsAffected?.[0] ?? 0;
    if (rowsAffected === 0) {
      return res.status(404).json({ error: `Producto con id ${id} no encontrado` });
    }

    // devolver el producto actualizado
    const updated = await pool
      .request()
      .input("idProducto", sql.Int, id)
      .query("SELECT * FROM Producto WHERE idProducto = @idProducto");

    res.json({ success: true, producto: updated.recordset[0] });
  } catch (err) {
    console.error("❌ Error al editar producto:", err, "id:", id);
    res.status(500).json({ error: "Error al editar producto" });
  }
};
