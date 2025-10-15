// src/app.js
import express from "express";
import cors from "cors";
import path from "path";
import productoRoutes from "./routes/productoRoutes.js";
import clienteRoutes from "./routes/clienteRoutes.js";
import movimientosRoutes from "./routes/movimientosRoutes.js";
import cotizacionRoutes from "./routes/cotizacionRoutes.js";

const app = express();
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());
app.use("/img/Productos", express.static(path.join(__dirname, "src/img/Productos")));
app.use("/api", productoRoutes);
app.use("/api", clienteRoutes);
app.use("/api", movimientosRoutes);
app.use('/pdf', express.static(path.join(process.cwd(), 'src/pdf')));
app.use('/api', cotizacionRoutes);



export default app;
