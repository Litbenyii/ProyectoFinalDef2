require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const coordinationRoutes = require("./routes/coordination.routes");

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/coord", coordinationRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// 🔑 CLAVE PARA SERVIDOR
const PORT = process.env.PORT || 80;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend corriendo en http://0.0.0.0:${PORT}`);
});
