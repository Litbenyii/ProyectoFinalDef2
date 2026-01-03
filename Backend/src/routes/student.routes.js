const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  getOffers,
  getMyRequestsController,
  createPracticeRequestController,
  createApplicationController,
} = require("../controllers/student.controller");

const {
  authMiddleware,
  requireStudent,
} = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware, requireStudent);

router.get("/offers", getOffers);
router.get("/my/requests", getMyRequestsController);
router.post("/practice-requests", createPracticeRequestController);
router.post("/applications/:offerId", createApplicationController);

// Reemplaza tu ruta de bitácora por esta
router.post("/my/logbooks", upload.single("logbook"), async (req, res) => {
  try {
    const { practiceId, description } = req.body;
    const userId = req.user.id; // ID que viene del token

    // Buscamos al estudiante por su user_id
    const studentQuery = await pool.query("SELECT id FROM students WHERE user_id = $1", [userId]);
    const student = studentQuery.rows[0];

    if (!student) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    // Insertamos la bitácora
    // IMPORTANTE: Asegúrate de que la tabla 'logbooks' acepte el ID que estás mandando
    await pool.query(
      "INSERT INTO logbooks (student_id, practice_id, file_path, description) VALUES ($1, $2, $3, $4)",
      [student.id, practiceId, req.file.path, description]
    );

    res.json({ message: "Bitácora subida con éxito" });
  } catch (e) {
    console.error("ERROR CRITICO DB:", e.message); // Esto te dirá el error real en la terminal
    res.status(500).json({ message: "Error interno: " + e.message });
  }
});

module.exports = router;
