import { pool, sql } from "../config/db.js";

export const getCliente = async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM Cliente ORDER BY idCliente");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error getCliente:", err);
    res.status(500).send(err.message);
  }
};
export const getDetalleCliente = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Falta el ID del cliente" });
  }
  try {
    const result = await pool
      .request()
      .input("idCliente", sql.Int, id)
      .query("SELECT * FROM Cliente where idCliente = @idCliente");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error getDetalleCliente:", err);
    res.status(500).send(err.message);
  }
};
export const deleteCliente = async (req, res) => {
  const { id } = req.params;
  try {
    await pool
      .request()
      .input("idCliente", sql.Int, id)
      .query("DELETE FROM Cliente WHERE idCliente = @idCliente");
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar cliente:", err);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
};

export const createCliente = async (req, res) => {
  const { nombre, domicilio, telefono, correo, tipo, contacto } = req.body;
  try {
    const request = pool.request()
      .input("nombre", sql.NVarChar(50), nombre)
      .input("contacto", sql.NVarChar(50), contacto ?? null)
      .input("telefono", sql.NVarChar(10), telefono ?? null)
      .input("correo", sql.NVarChar(30), correo ?? null)
      .input("domicilio", sql.NVarChar(100), domicilio ?? null)
      .input("tipo", sql.NVarChar(8), tipo ?? null);

    const result = await request.query(`
      INSERT INTO Cliente (nombre, contacto, telefono, correo, domicilio, tipo)
      OUTPUT INSERTED.*
      VALUES (@nombre, @contacto, @telefono, @correo, @domicilio, @tipo)
    `);

    const created = result.recordset[0];
    res.status(201).json(created);
  } catch (err) {
    console.error("❌ Error al agregar cliente:", err);
    res.status(500).json({ error: "Error al agregar cliente" });
  }
};



export const editCliente = async (req, res) => {
  const { id } = req.params; // viene del endpoint /api/cliente/:id
  const { nombre, telefono, correo, domicilio, tipo, contacto } = req.body;

  try {
    // Validación simple
    if (!id) {
      return res.status(400).json({ error: "Falta el ID del cliente" });
    }

    // Ejecuta el update
    const result = await pool
      .request()
      .input("idCliente", sql.Int, id)
      .input("nombre", sql.NVarChar(50), nombre)
      .input("contacto", sql.NVarChar(50), contacto)
      .input("telefono", sql.NVarChar(10), telefono)
      .input("correo", sql.NVarChar(30), correo)
      .input("domicilio", sql.NVarChar(100), domicilio)
      .input("tipo", sql.NVarChar(8), tipo)
      .query(`
        UPDATE Cliente
        SET nombre = @nombre,
            contacto = @contacto,
            telefono = @telefono,
            correo = @correo,
            domicilio = @domicilio,
            tipo = @tipo
        WHERE idCliente = @idCliente
      `);

    // Verifica si se actualizó algo
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.status(200).json({ message: "Cliente actualizado correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar cliente:", err);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};

