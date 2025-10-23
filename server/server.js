
import app from "../client/src/App.js";
import { connectDB } from "./config/db.js";

const PORT = 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`✅ Servidor corriendo en  http://localhost:${PORT}`));
};

startServer();