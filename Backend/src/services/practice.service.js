const pool = require("../config/db");

//ESTUDIANTE – SOLICITUD EXTERNA
async function createPracticeRequest(studentId, data) {
  const {
    company,
    tutorName,
    tutorEmail,
    startDate,
    endDate,
    location,
    modality,
    details,
  } = data;

  if (!company || !tutorName || !tutorEmail) {
    throw new Error("Faltan datos obligatorios");
  }

  const result = await pool.query(
    `
    INSERT INTO practice_requests
      (student_id, company, tutor_name, tutor_email, start_date, end_date, location, modality, details)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
    `,
    [
      studentId,
      company,
      tutorName,
      tutorEmail,
      startDate || null,
      endDate || null,
      location || null,
      modality || null,
      details || "",
    ]
  );

  return result.rows[0];
}

//COORDINACIÓN – SOLICITUDES
async function getCoordinatorPracticeRequests() {
  const res = await pool.query(
    `
    SELECT
      pr.id,
      pr.company,
      pr.status,
      s.full_name,
      s.id AS student_id
    FROM practice_requests pr
    JOIN students s ON pr.student_id = s.id
    ORDER BY pr.created_at DESC
    `
  );
  return res.rows;
}

async function updatePracticeRequestStatus(id, status) {
  if (!["Aprobada", "Rechazada"].includes(status)) {
    throw new Error("Estado inválido");
  }

  const reqRes = await pool.query(
    `
    UPDATE practice_requests
    SET status = $1
    WHERE id = $2
    RETURNING *
    `,
    [status, id]
  );

  const request = reqRes.rows[0];

  //Al aprobar → crear práctica
  if (status === "Aprobada") {
    await pool.query(
      `
      INSERT INTO practices (student_id, company, practice_request_id)
      VALUES ($1, $2, $3)
      `,
      [request.student_id, request.company, request.id]
    );
  }

  return request;
}

//PRÁCTICAS
async function getOpenPractices() {
  const res = await pool.query(
    `
    SELECT
      p.id,
      p.company,
      s.full_name AS student_name
    FROM practices p
    JOIN students s ON p.student_id = s.id
    WHERE p.evaluator_id IS NULL
    ORDER BY p.created_at DESC
    `
  );
  return res.rows;
}

async function assignEvaluatorToPractice(practiceId, evaluatorId) {
  const res = await pool.query(
    `
    UPDATE practices
    SET evaluator_id = $1
    WHERE id = $2
    RETURNING *
    `,
    [evaluatorId, practiceId]
  );
  return res.rows[0];
}

async function closePractice(practiceId) {
  const res = await pool.query(
    `
    UPDATE practices
    SET end_date = CURRENT_DATE
    WHERE id = $1
    RETURNING *
    `,
    [practiceId]
  );
  return res.rows[0];
}

//EVALUADORES
async function getEvaluators() {
  const res = await pool.query(
    "SELECT * FROM evaluators ORDER BY name"
  );
  return res.rows;
}

async function createEvaluator(data) {
  const { name, email, specialty } = data;
  if (!name || !email) throw new Error("Datos incompletos");

  const res = await pool.query(
    `
    INSERT INTO evaluators (name, email, specialty)
    VALUES ($1,$2,$3)
    RETURNING *
    `,
    [name, email, specialty || "General"]
  );

  return res.rows[0];
}

// ✅ EXPORTS CORRECTOS
module.exports = {
  // estudiante
  createPracticeRequest,

  // coordinación
  getCoordinatorPracticeRequests,
  updatePracticeRequestStatus,
  getOpenPractices,
  assignEvaluatorToPractice,
  closePractice,
  getEvaluators,
  createEvaluator,
};
