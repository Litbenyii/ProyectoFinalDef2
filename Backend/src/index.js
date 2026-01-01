const express = require("express");
const cors = require("cors");
const config = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const coordinationRoutes = require("./routes/coordination.routes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API de prácticas UBB funcionando" });
});

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/coord", coordinationRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Error interno del servidor" });
});

app.listen(config.PORT, () => {
  console.log(`✅ Backend escuchando en http://localhost:${config.PORT}`);
});
