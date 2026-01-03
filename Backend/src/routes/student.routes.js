const pool = require("../config/db");

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
    const userId = req.user.id;

    const studentRes = await pool.query(
      "SELECT id FROM students WHERE user_id = $1",
      [userId]
    );

    if (studentRes.rows.length === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    const practiceCheck = await pool.query(
      "SELECT id FROM practices WHERE id = $1",
      [practiceId]
    );

    if (practiceCheck.rows.length === 0) {
      return res.status(400).json({ message: "Práctica no válida" });
    }

    await pool.query(
      `
      INSERT INTO logbooks (student_id, practice_id, file_path, description)
      VALUES ($1, $2, $3, $4)
      `,
      [
        studentRes.rows[0].id,
        practiceId,
        req.file.path,
        description || null,
      ]
    );

    res.json({ message: "Bitácora subida con éxito" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al subir bitácora" });
  }
});

module.exports = router;
