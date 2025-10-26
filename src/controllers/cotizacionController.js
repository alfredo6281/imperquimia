import sql from "mssql";
import { pool } from "../config/db.js";
/*
////////////////////////////////////////////////
--------------------CRUD-----------------------
////////////////////////////////////////////////
*/
export const getDetallesCotizacion = async (req, res) => {
  const { id } = req.params; // viene del endpoint /api/cotizacion/:id

  try {
    if (!id) {
      return res.status(400).json({ error: "Falta el ID de la cotización" });
    }

    const result = await pool.request()
      .input("idCotizacion", sql.Int, id)
      .query(`
        SELECT 
          p.nombre AS producto,
          dc.cantidad,
          dc.precioUnitario AS precio,
          (dc.cantidad * dc.precioUnitario) AS subtotal,
          dc.idProducto,
          p.tipo,
          p.unidad,
          p.unidadMedida
        FROM cotizacion c
        INNER JOIN detalleCotizacion dc 
            ON c.idCotizacion = dc.idCotizacion
        INNER JOIN producto p 
            ON dc.idProducto = p.idProducto
        WHERE c.idCotizacion = @idCotizacion;
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getCotizacion = async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
      SELECT 
          c.idCotizacion AS idCotizacion,
          c.fecha,
          c.total,
          c.estado,
          cli.idCliente,
          cli.nombre as cliente,
          u.usuario as usuario,
          c.nota,
        'Material' AS tipo
      FROM cotizacion AS c
      INNER JOIN Cliente AS cli ON c.idCliente = cli.idCliente
      INNER JOIN Usuario AS u ON c.idUsuario = u.idUsuario

      UNION ALL

      SELECT 
          m.idCotizacionMa AS idCotizacion,
          m.fecha,
          CAST(m.precio * m.superficie AS DECIMAL(12,2)) AS total,
          m.estado,
          cli.idCliente,
          cli.nombre as cliente,
          u.usuario as usuario,
          m.nota,
        'Mano de obra' AS tipo
      FROM cotizacionMa AS m
      INNER JOIN Cliente AS cli ON m.idCliente = cli.idCliente
      INNER JOIN Usuario AS u ON m.idUsuario = u.idUsuario

      ORDER BY c.idCotizacion DESC;`);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
export const createCotizacion = async (req, res) => {
  const {
    fecha,
    total,
    tipo,
    estado,
    idCliente,
    idUsuario,
    nota,
  } = req.body;

  try {
    const result = await pool
      .request()
      .input("fecha", sql.date, fecha)
      .input("total", sql.Decimal(12, 2), total)
      .input("tipo", sql.bit, tipo)
      .input("estado", sql.NVarChar(20), estado)
      .input("idCliente", sql.Int, idCliente)
      .input("idUsuario", sql.Int, idUsuario)
      .input("nota", sql.NVarChar(300), nota)
      .query(`
        INSERT INTO Producto (fecha, total, tipo, estado, idCliente, idUsuario, nota)
        
        VALUES (@fecha, @total, @tipo, @estado, @idCliente, @idUsuario, @nota)
      `);
    //No se usa porque el codigo se pone manual, se usa la siguiente linea cuando el id se pone automatico
    //const idProducto = result.recordset[0].idProducto;
    res.status(201).json({ message: "Cotizacion creada correctamente", idProducto });
  } catch (err) {
    console.error("❌ Error al crear cotizacion:", err, "cotizacion:", idProducto);
    res.status(500).json({ error: "Error al insertar cotizacion" });
  }
};

export const getCotizacionManoObra = async (req, res) => {
  const { id } = req.params; // viene del endpoint /api/cotizacion/:id
  try {
    if (!id) {
      return res.status(400).json({ error: "Falta el ID de la cotización" });
    }
    const result = await pool.request()
      .input("idCotizacion", sql.Int, id)
      .query(`
      SELECT 
        c.idCotizacionMa,
        c.descripcion,
        c.sistema,
        c.fecha, 
        c.acabado,
        c.superficie,
        c.precio,
        c.superficie * c.precio as subtotal, 
        c.anticipo,
        c.saldo,
        c.garantia,
        c.estado, 
        c.nota, 
        cli.nombre as cliente, 
        u.usuario AS usuario 
      FROM cotizacionMa c 
        INNER JOIN Cliente cli 
          ON c.idCliente = cli.idCliente 
        INNER JOIN Usuario u 
          ON c.idUsuario = u.idUsuario 
      WHERE c.idCotizacionMa = @idCotizacion;`);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};