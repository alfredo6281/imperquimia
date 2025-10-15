import { pool, sql } from "../config/db.js";

export const getCliente = async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM Cliente");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
export const createCliente = async (req, res) => {
  const { nombre, domicilio, telefono, correo } = req.body;

  try {
    const result = await pool
      .request()
      .input("nombre", sql.NVarChar(50), nombre)
      .input("telefono", sql.NVarChar(10), telefono)
      .input("correo", sql.NVarChar(30), correo)
      .input("domicilio", sql.NVarChar(100), domicilio)
      .query(`
        INSERT INTO Cliente (nombre, telefono, correo, domicilio)
        OUTPUT INSERTED.idCliente
        VALUES (@nombre, @telefono, @correo, @domicilio)
      `);

    const idCliente = result.recordset[0].idCliente;
    res.status(201).json({ message: "Cliente agregado correctamente", idCliente });
  } catch (err) {
    console.error("❌ Error al agregar cliente:", err);
    res.status(500).json({ error: "Error al agregar cliente" });
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
