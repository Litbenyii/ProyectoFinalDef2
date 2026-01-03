const pool = require("../config/db");

// Crear oferta (coordinación)
async function createOffer(data, userId) {
  const { title, company, location, hours, modality, details } = data;

  if (!title || !company || !details) {
    throw new Error("Faltan campos obligatorios");
  }

  const result = await pool.query(
    `
    INSERT INTO offers (title, company, location, hours, modality, description, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [title, company, location || null, hours || null, modality || null, details, userId]
  );

  return result.rows[0];
}

// Listar TODAS las ofertas
async function listAllOffers() {
  const result = await pool.query(
    "SELECT * FROM offers ORDER BY created_at DESC"
  );
  return result.rows;
}

// Listar ofertas visibles al estudiante
async function listActiveOffers() {
  const result = await pool.query(
    "SELECT * FROM offers ORDER BY created_at DESC"
  );
  return result.rows;
}

// Eliminar oferta
async function deactivateOffer(id) {
  await pool.query("DELETE FROM offers WHERE id = $1", [id]);
}

module.exports = {
  createOffer,
  listAllOffers,
  listActiveOffers,
  deactivateOffer,
};
