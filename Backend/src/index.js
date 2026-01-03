const express = require("express");
const cors = require("cors");
const config = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const coordinationRoutes = require("./routes/coordination.routes");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json()); 
app.use('/uploads', express.static('uploads'));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/coord", coordinationRoutes); 
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend escuchando en http://localhost:${PORT}`);
});
