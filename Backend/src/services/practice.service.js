const pool = require("../config/db");

//Crear solicitud de práctica externa
async function createPracticeRequest(studentId, payload) {
  const {
    company,
    tutorName,
    tutorEmail,
    startDate,
    endDate,
    details,
    location,
    modality,
  } = payload;

  if (!studentId || !company || !tutorName || !tutorEmail) {
    throw new Error("Faltan datos obligatorios de la solicitud");
  }

  const mergedDetails =
    `Ubicación: ${location || "No indicada"}\n` +
    `Modalidad: ${modality || "No indicada"}\n\n` +
    (details || "");

  const result = await pool.query(
    `
    INSERT INTO practice_requests
      (student_id, company, tutor_name, tutor_email, start_date, end_date, details, status, location, modality, merged_details)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, 'Pendiente', $8, $9, $10)
    RETURNING *
    `,
    [
      studentId,           // $1
      company,             // $2
      tutorName,           // $3
      tutorEmail,          // $4
      startDate || null,   // $5
      endDate || null,     // $6
      details || "",       // $7
      location || null,    // $8
      modality || null,    // $9
      mergedDetails,      // $10
    ]
  );

  return result.rows[0];
}

//Obtener solicitudes de práctica (coordinador)
async function getCoordinatorPracticeRequests() {
  const result = await pool.query(
    `
    SELECT
      pr.*,
      s.full_name,
      s.career,
      u.email
    FROM practice_requests pr
    JOIN students s ON pr.student_id = s.id
    JOIN users u ON s.user_id = u.id
    ORDER BY pr.created_at DESC
    `
  );

  return result.rows;
}

//Actualizar estado de solicitud
async function updatePracticeRequestStatus(id, status) {
  const result = await pool.query(
    `
    UPDATE practice_requests
    SET status = $1
    WHERE id = $2
    RETURNING *
    `,
    [status, id]
  );

  return result.rows[0];
}

//Obtener prácticas (todas)
async function getPractices() {
  const result = await pool.query(
    `
    SELECT
      p.*,
      s.full_name,
      u.email,
      e.name AS evaluator_name
    FROM practices p
    JOIN students s ON p.student_id = s.id
    JOIN users u ON s.user_id = u.id
    LEFT JOIN evaluators e ON p.approved_by = e.id
    ORDER BY p.created_at DESC
    `
  );

  return result.rows;
}

//Listar evaluadores
async function getEvaluators() {
  const result = await pool.query(
    `
    SELECT *
    FROM evaluators
    ORDER BY name ASC
    `
  );

  return result.rows;
}

//Asignar evaluador a práctica
async function assignEvaluatorToPractice(practiceId, evaluatorId) {
  const result = await pool.query(
    `
    UPDATE practices
    SET approved_by = $1
    WHERE id = $2
    RETURNING *
    `,
    [evaluatorId, practiceId]
  );

  return result.rows[0];
}

//Cerrar práctica
async function closePractice(practiceId) {
  const result = await pool.query(
    `
    UPDATE practices
    SET end_date = CURRENT_DATE
    WHERE id = $1
    RETURNING *
    `,
    [practiceId]
  );

  return result.rows[0];
}

async function getOpenPractices() {
  const result = await pool.query(`
    SELECT *
    FROM practices
    WHERE approved_by IS NULL
    ORDER BY created_at DESC
  `);
  return result.rows;
}

async function createEvaluator(data) {
  const { name, email, specialty } = data;
  const result = await pool.query(
    `INSERT INTO evaluators (name, email, specialty) VALUES ($1, $2, $3) RETURNING *`,
    [name, email, specialty || "General"]
  );
  return result.rows[0];
}

module.exports = {
  createPracticeRequest,
  getCoordinatorPracticeRequests,
  updatePracticeRequestStatus,
  getPractices,
  getOpenPractices, 
  getEvaluators,
  assignEvaluatorToPractice,
  closePractice,
  createEvaluator,
};
