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

      if (!practiceId) {
        return res.status(400).json({ message: "practiceId es obligatorio" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Debe adjuntar un archivo" });
      }

    // 1️⃣ Obtener estudiante
    const studentRes = await pool.query(
      "SELECT id, full_name FROM students WHERE user_id = $1",
      [userId]
    );

    if (studentRes.rows.length === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    const studentId = studentRes.rows[0].id;
    const studentName = studentRes.rows[0].full_name;

    // 2️⃣ Verificar práctica válida
    const practiceRes = await pool.query(
      `
      SELECT
        p.id,
        p.company,
        e.email AS evaluator_email,
        e.name AS evaluator_name
      FROM practices p
      JOIN evaluators e ON p.evaluator_id = e.id
      WHERE p.id = $1
      `,
      [practiceId]
    );

    if (practiceRes.rows.length === 0) {
      return res.status(400).json({ message: "Práctica no válida" });
    }

    const practice = practiceRes.rows[0];

    // 3️⃣ Guardar bitácora
    await pool.query(
      `
      INSERT INTO logbooks (student_id, practice_id, file_path, description)
      VALUES ($1, $2, $3, $4)
      `,
      [studentId, practiceId, req.file.path, description || null]
    );

    // 4️⃣ Enviar correo al evaluador (NO bloqueante)
    const { sendAssignmentEmail } = require("../services/email.service");

    sendAssignmentEmail(
      practice.evaluator_email,
      practice.evaluator_name,
      studentName,
      practice.company
    );

    // 5️⃣ Responder al frontend
    res.json({ message: "Bitácora subida con éxito" });
  } catch (e) {
    console.error("ERROR BITÁCORA:", e);
    res.status(500).json({ message: "Error al subir bitácora" });
  }
});


module.exports = router;