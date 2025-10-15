import sql from "mssql";

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

const pool = new sql.ConnectionPool(dbConfig);

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log("✅ Conectado a SQL Server");
    return pool;
  } catch (err) {
    console.error("❌ Error de conexión a SQL Server:", err);
    throw err;
  }
};

export { pool, sql };