import sql from "mssql";
import { pool } from "../config/db.js";

/**
 * Obtiene los detalles (productos) de una cotización
 * GET /cotizacion/detalle/:id
 */
export const getDetallesCotizacion = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).json({ error: "Falta el ID de la cotización" });

    const result = await pool.request()
      .input("idCotizacion", sql.Int, Number(id))
      .query(`
        SELECT 
          p.nombre AS producto,
          dc.cantidad,
          dc.precioUnitario AS precio,
          (dc.cantidad * dc.precioUnitario) AS subtotal,
          dc.idProducto,
          p.tipo,
          p.unidad,
          p.unidadMedida,
          p.color
        FROM cotizacion c
        INNER JOIN detalleCotizacion dc ON c.idCotizacion = dc.idCotizacion
        LEFT JOIN producto p ON dc.idProducto = p.idProducto
        WHERE c.idCotizacion = @idCotizacion;
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("getDetallesCotizacion error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lista cotizaciones (materiales + mano de obra) - combinado
 * GET /cotizacion
 */
export const getCotizacion = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT * FROM (
        SELECT 
          c.idCotizacion AS idCotizacion,
          c.fecha,
          COALESCE(v.total, 0) AS total, 
          c.estado,
          cli.idCliente,
          cli.nombre as cliente,
          u.usuario as usuario,
          c.nota,
          'Material' AS tipo
        FROM cotizacion AS c
        INNER JOIN Cliente AS cli ON c.idCliente = cli.idCliente
        INNER JOIN Usuario AS u ON c.idUsuario = u.idUsuario
        LEFT JOIN dbo.vwCotizacionTotals v ON v.idCotizacion = c.idCotizacion

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
      ) AS t
      ORDER BY idCotizacion DESC;
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("getCotizacion error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Crear una cotización simple (cabecera únicamente)
 * -- NO recomendado si necesitas detalles: mejor usar crearCotizacion (cabecera + detalles)
 * POST /cotizacion/simple  (si decides usarlo)
 */
export const createCotizacionSimple = async (req, res) => {
  try {
    const { total = 0, estado = "Pendiente", idCliente, idUsuario, nota = "" } = req.body;
    if (!idCliente) return res.status(400).json({ error: "Falta idCliente" });
    if (!idUsuario) return res.status(400).json({ error: "Falta idUsuario" });

    const result = await pool.request()
      .input("total", sql.Decimal(12, 2), Number(total) || 0)
      .input("estado", sql.NVarChar(20), estado)
      .input("idCliente", sql.Int, Number(idCliente))
      .input("idUsuario", sql.Int, Number(idUsuario))
      .input("nota", sql.NVarChar(300), nota)
      .query(`
        INSERT INTO cotizacion (fecha, total, estado, idCliente, idUsuario, nota)
        VALUES (GETDATE(), @total, @estado, @idCliente, @idUsuario, @nota);
        SELECT SCOPE_IDENTITY() AS idCotizacion;
      `);

    const idCotizacion = result.recordset?.[0]?.idCotizacion;
    return res.status(201).json({ success: true, idCotizacion });
  } catch (err) {
    console.error("createCotizacionSimple error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Obtener cotización de mano de obra por id
 * GET /cotizacion/mano/:id
 */
export const getCotizacionManoObra = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).json({ error: "Falta el ID de la cotización" });

    const result = await pool.request()
      .input("idCotizacion", sql.Int, Number(id))
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
        INNER JOIN Cliente cli ON c.idCliente = cli.idCliente 
        INNER JOIN Usuario u ON c.idUsuario = u.idUsuario 
        WHERE c.idCotizacionMa = @idCotizacion;
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("getCotizacionManoObra error:", err);
    res.status(500).json({ error: err.message });
  }
};
export const createCotizacionManoObra = async (req, res) => {
  try {
    const { estado = "Pendiente", idCliente, idUsuario, nota,
      descripcion, sistema, acabado, superficie, precio, anticipo, saldo, garantia } = req.body;
    if (!idCliente) return res.status(400).json({ error: "Falta idCliente" });
    if (!idUsuario) return res.status(400).json({ error: "Falta idUsuario" });

    const result = await pool.request()
      .input("descripcion", sql.NVarChar, descripcion)
      .input("sistema", sql.NVarChar(50), sistema)
      .input("acabado", sql.NVarChar(20), acabado)
      .input("superficie", sql.Decimal(12, 2), superficie)
      .input("precio", sql.Decimal(12, 2), precio)
      .input("anticipo", sql.Int, anticipo)
      .input("saldo", sql.Int, saldo)
      .input("garantia", sql.Int, garantia)
      .input("estado", sql.NVarChar(20), estado)
      .input("nota", sql.NVarChar(300), nota)
      .input("idCliente", sql.Int, Number(idCliente))
      .input("idUsuario", sql.Int, Number(idUsuario))
      .query(`
        INSERT INTO cotizacionMa (fecha, descripcion, sistema, acabado, superficie, 
        precio, anticipo, saldo, garantia, idCliente, idUsuario, nota, estado)
        OUTPUT INSERTED.idCotizacionMa
        VALUES (GETDATE(), @descripcion, @sistema, @acabado, @superficie, @precio, @anticipo, 
        @saldo, @garantia, @idCliente, @idUsuario, @nota, @estado);
      `);

    const idCotizacionMa = result.recordset?.[0]?.idCotizacionMa;
    return res.status(201).json({ success: true, idCotizacionMa });
  } catch (err) {
    console.error("createCotizacionManoObra error:", err);
    res.status(500).json({ error: err.message });
  }
};
/* -------------------------
   Detalle: insertar 1 registro
   POST /detalleCotizacion
   body: { idCotizacion, idProducto|null, cantidad, precioUnitario }
   ------------------------- */
export const createDetalleCotizacion = async (req, res) => {
  try {
    const { idCotizacion, idProducto = null, cantidad = 0, precioUnitario = 0 } = req.body;

    if (!idCotizacion) return res.status(400).json({ error: "Falta idCotizacion" });

    const reqDb = pool.request();
    reqDb.input("idCotizacion", sql.Int, Number(idCotizacion));
    // si idProducto es null lo pasamos como null
    reqDb.input("idProducto", sql.Int, idProducto == null ? null : Number(idProducto));
    reqDb.input("cantidad", sql.Int, Number(cantidad) || 0);
    reqDb.input("precioUnitario", sql.Decimal(12, 2), Number(precioUnitario) || 0);

    await reqDb.query(`
      INSERT INTO detalleCotizacion (idCotizacion, idProducto, cantidad, precioUnitario)
      VALUES (@idCotizacion, @idProducto, @cantidad, @precioUnitario);
    `);

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("createDetalleCotizacion error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* -------------------------
   Detalle: insertar en batch (transacción)
   POST /detalleCotizacion/batch
   body: { idCotizacion?, detalles: [ { idCotizacion?, idProducto, cantidad, precioUnitario }, ... ] }
   ------------------------- */
export const createDetalleCotizacionBatch = async (req, res) => {
  const { idCotizacion: globalId, detalles } = req.body;

  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: "Debe enviar 'detalles' como array no vacío" });
  }

  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    for (const d of detalles) {
      const idCot = globalId ?? d.idCotizacion;
      if (!idCot) {
        await transaction.rollback();
        return res.status(400).json({ error: "Falta idCotizacion en el batch (global o por item)" });
      }

      const reqIns = new sql.Request(transaction);
      const idProductoVal = d.idProducto != null ? Number(d.idProducto) : null;

      reqIns.input("idCotizacion", sql.Int, Number(idCot));
      reqIns.input("idProducto", sql.Int, idProductoVal);
      reqIns.input("cantidad", sql.Int, Number(d.cantidad) || 0);
      reqIns.input("precioUnitario", sql.Decimal(12, 2), Number(d.precioUnitario || 0));

      await reqIns.query(`
        INSERT INTO detalleCotizacion (idCotizacion, idProducto, cantidad, precioUnitario)
        VALUES (@idCotizacion, @idProducto, @cantidad, @precioUnitario);
      `);
    }

    await transaction.commit();
    return res.status(201).json({ success: true, inserted: detalles.length });
  } catch (err) {
    console.error("createDetalleCotizacionBatch error:", err);
    try { await transaction.rollback(); } catch (rbErr) { console.error("Rollback error:", rbErr); }
    return res.status(500).json({ error: err.message });
  }
};

/* -------------------------
   Crear cotizacion + detalles en una sola petición
   POST /cotizacion/crear
   body: { total, idCliente, idUsuario, nota, detalles: [ { idProducto|null, cantidad, precioUnitario } ] }
   ------------------------- */
export const crearCotizacion = async (req, res) => {
  // aceptar dos shapes: { total, idCliente, idUsuario, nota, detalles }
  // o { cotizacion: { total, idCliente, idUsuario, nota }, detalles }
  let { total, idCliente, idUsuario, nota, detalles } = req.body;

  if (req.body && req.body.cotizacion && typeof req.body.cotizacion === 'object') {
    const c = req.body.cotizacion;
    total = total ?? c.total;
    idCliente = idCliente ?? c.idCliente;
    idUsuario = idUsuario ?? c.idUsuario;
    nota = nota ?? c.nota;
    detalles = detalles ?? req.body.detalles ?? c.detalles;
  }

  // validaciones
  if (!idCliente) return res.status(400).json({ error: "Falta idCliente" });
  if (!idUsuario) return res.status(400).json({ error: "Falta idUsuario" });
  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: "Debe enviar al menos un detalle" });
  }

  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    const reqInsert = new sql.Request(transaction);
    reqInsert.input("total", sql.Decimal(12, 2), Number(total) || 0);
    reqInsert.input("estado", sql.NVarChar(20), "Pendiente");
    reqInsert.input("idCliente", sql.Int, Number(idCliente));
    reqInsert.input("idUsuario", sql.Int, Number(idUsuario));
    reqInsert.input("nota", sql.NVarChar(300), nota ?? "");

    const insertCot = await reqInsert.query(`
      INSERT INTO cotizacion (fecha, total, estado, idCliente, idUsuario, nota)
      OUTPUT INSERTED.idCotizacion
      VALUES (GETDATE(), @total, @estado, @idCliente, @idUsuario, @nota);
    `);

    // log del resultado para debug
    console.log("insertCot.recordset:", insertCot.recordset);

    const idCotizacion = insertCot.recordset?.[0]?.idCotizacion;
    if (!idCotizacion) {
      await transaction.rollback();
      console.error("crearCotizacion: no se obtuvo idCotizacion. Result:", insertCot);
      return res.status(500).json({ error: "No se obtuvo idCotizacion" });
    }

    // insertar detalles
    for (const d of detalles) {
      const reqDet = new sql.Request(transaction);
      const idProductoVal = d.idProducto != null ? Number(d.idProducto) : null;

      reqDet.input("idCotizacion", sql.Int, Number(idCotizacion));
      reqDet.input("idProducto", sql.Int, idProductoVal);
      reqDet.input("cantidad", sql.Int, Number(d.cantidad) || 0);
      reqDet.input("precioUnitario", sql.Decimal(12, 2), Number(d.precioUnitario || 0));

      await reqDet.query(`
        INSERT INTO detalleCotizacion (idCotizacion, idProducto, cantidad, precioUnitario)
        VALUES (@idCotizacion, @idProducto, @cantidad, @precioUnitario);
      `);
    }

    await transaction.commit();
    return res.status(201).json({ success: true, idCotizacion });
  } catch (err) {
    console.error("crearCotizacion error:", err);
    try { await transaction.rollback(); } catch (rbErr) { console.error("Rollback error:", rbErr); }
    return res.status(500).json({ error: err.message ?? "Error al crear cotización" });
  }
};


/* -------------------------
   Alternativa: crear cotizacion con estructura { cotizacion, detalles }
   POST /cotizacion/con-detalles
   ------------------------- */
export const createCotizacionConDetalles = async (req, res) => {
  const { cotizacion, detalles } = req.body;

  if (!cotizacion || typeof cotizacion !== "object") {
    return res.status(400).json({ error: "Falta objeto 'cotizacion' en body" });
  }
  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: "Debe enviar al menos un detalle" });
  }

  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    const reqIns = new sql.Request(transaction);
    reqIns.input("total", sql.Decimal(12, 2), Number(cotizacion.total) || 0);
    reqIns.input("estado", sql.NVarChar(20), cotizacion.estado || "Pendiente");
    reqIns.input("idCliente", sql.Int, Number(cotizacion.idCliente));
    reqIns.input("idUsuario", sql.Int, Number(cotizacion.idUsuario));
    reqIns.input("nota", sql.NVarChar(300), cotizacion.nota ?? null);

    const insertCot = await reqIns.query(`
      INSERT INTO cotizacion (fecha, total, estado, idCliente, idUsuario, nota)
      VALUES (GETDATE(), @total, @estado, @idCliente, @idUsuario, @nota);
      SELECT SCOPE_IDENTITY() AS idCotizacion;
    `);

    const idCotizacion = insertCot.recordset?.[0]?.idCotizacion;
    if (!idCotizacion) {
      await transaction.rollback();
      return res.status(500).json({ error: "No se pudo obtener idCotizacion" });
    }

    for (const d of detalles) {
      const reqDet = new sql.Request(transaction);
      const idProductoVal = d.idProducto != null ? Number(d.idProducto) : null;

      reqDet.input("idCotizacion", sql.Int, Number(idCotizacion));
      reqDet.input("idProducto", sql.Int, idProductoVal);
      reqDet.input("cantidad", sql.Int, Number(d.cantidad) || 0);
      reqDet.input("precioUnitario", sql.Decimal(12, 2), Number(d.precioUnitario || 0));

      await reqDet.query(`
        INSERT INTO detalleCotizacion (idCotizacion, idProducto, cantidad, precioUnitario)
        VALUES (@idCotizacion, @idProducto, @cantidad, @precioUnitario);
      `);
    }

    await transaction.commit();
    return res.status(201).json({ success: true, idCotizacion });
  } catch (err) {
    console.error("createCotizacionConDetalles error:", err);
    try { await transaction.rollback(); } catch (rbErr) { console.error("Rollback err:", rbErr); }
    return res.status(500).json({ error: err.message ?? "Error al crear cotización" });
  }
};
