import { pool, sql } from "../config/db.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();

export const getMovimientos = async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM Movimiento");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};