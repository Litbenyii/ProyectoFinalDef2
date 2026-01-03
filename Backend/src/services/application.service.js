const pool = require("../config/db");

// Verificar si el alumno ya tiene algo en curso
async function hasActiveProcess(studentId) {
  const result = await pool.query(
    `
    SELECT id FROM applications WHERE student_id = $1 AND status = 'Pendiente'
    UNION
    SELECT id FROM practice_requests WHERE student_id = $1 AND status = 'Pendiente'
    LIMIT 1
    `,
    [studentId]
  );
  return result.rows.length > 0;
}

// Crear postulación interna
async function createApplication(studentId, offerId) {
  const busy = await hasActiveProcess(studentId);
  if (busy) {
    throw new Error("Ya tienes una postulación o solicitud en curso");
  }

  const result = await pool.query(
    `
    INSERT INTO applications (student_id, offer_id, status)
    VALUES ($1, $2, 'Pendiente')
    RETURNING *
    `,
    [studentId, offerId]
  );

  return result.rows[0];
}

// Obtener solicitudes del alumno
async function getMyRequests(studentId) {
  const internal = await pool.query(
    `
    SELECT
      a.id,
      'INTERNAL' AS type,
      o.title AS "offerTitle",
      o.company,
      a.status,
      a.created_at
    FROM applications a
    JOIN offers o ON a.offer_id = o.id
    WHERE a.student_id = $1
    `,
    [studentId]
  );

  const external = await pool.query(
    `
    SELECT
      pr.id,
      'EXTERNAL' AS type,
      pr.company,
      pr.status,
      pr.created_at
    FROM practice_requests pr
    WHERE pr.student_id = $1
    `,
    [studentId]
  );

  return [...internal.rows, ...external.rows].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

// Coordinación: ver postulaciones internas
async function getCoordinatorApplications() {
  const result = await pool.query(
    `
    SELECT
      a.id,
      a.status,
      s.full_name,
      o.title,
      o.company
    FROM applications a
    JOIN students s ON a.student_id = s.id
    JOIN offers o ON a.offer_id = o.id
    ORDER BY a.created_at DESC
    `
  );
  return result.rows;
}

// Aprobar / rechazar postulación
async function updateApplicationStatus(id, status) {
  if (!["Aprobada", "Rechazada"].includes(status)) {
    throw new Error("Estado inválido");
  }

  const result = await pool.query(
    `
    UPDATE applications
    SET status = $1
    WHERE id = $2
    RETURNING *
    `,
    [status, id]
  );

  return result.rows[0];
}

module.exports = {
  createApplication,
  getMyRequests,
  getCoordinatorApplications,
  updateApplicationStatus,
};
