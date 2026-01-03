const pool = require("../config/db");

async function hasActiveProcess(studentId) {
  const result = await pool.query(
    `
    SELECT id FROM applications WHERE student_id = $1 AND status != 'Rechazada'
    UNION
    SELECT id FROM practice_requests WHERE student_id = $1 AND status != 'Rechazada'
    LIMIT 1
    `,
    [studentId]
  );
  return result.rows.length > 0;
}

//Crear postulación a una oferta (solo una vez)
async function createApplication(studentId, offerId) {
  if (!studentId || !offerId) {
    throw new Error("Faltan datos para postular");
  }

  //Verificar si ya existe postulacion
  const alreadyBusy = await hasActiveProcess(studentId);
  if (alreadyBusy) {
    throw new Error("Ya tienes una postulación o solicitud en curso.");
  }

  //Crear postulacion
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

//Obtener mis solicitudes y postulaciones
async function getMyRequests(studentId) {
  // Postulaciones internas
  const applicationsResult = await pool.query(
    `
    SELECT
      a.id,
      'INTERNAL' AS type,
      a.status,
      a.created_at,
      o.title AS "offerTitle",
      o.company,
      NULL::date AS "startDate",
      NULL::date AS "endDate"
    FROM applications a
    JOIN offers o ON a.offer_id = o.id
    WHERE a.student_id = $1
    `,
    [studentId]
  );

  //Practicas externas
  const practicesResult = await pool.query(
    `
    SELECT
      pr.id,
      'EXTERNAL' AS type,
      pr.status,
      pr.created_at,
      NULL AS "offerTitle",
      pr.company,
      pr.start_date AS "startDate",
      pr.end_date AS "endDate"
    FROM practice_requests pr
    WHERE pr.student_id = $1
    `,
    [studentId]
  );

  // Unificar como hacia pgadmin
    const merged = [
      ...applicationsResult.rows,
      ...practicesResult.rows,
    ];

    // Ordenar por fecha
    merged.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

  return merged;
}

//Obtener todas las postulaciones (coordinador)  
async function getCoordinatorApplications() {
  const result = await pool.query(
    `
    SELECT
      a.*,
      s.full_name,
      u.email,
      o.title,
      o.company
    FROM applications a
    JOIN students s ON a.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN offers o ON a.offer_id = o.id
    ORDER BY a.created_at DESC
    `
  );

  return result.rows;
}

//Actualizar estado de postulación
async function updateApplicationStatus(id, status) {
  const allowed = ["Pendiente", "Aprobada", "Rechazada"];
  if (!allowed.includes(status)) {
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
