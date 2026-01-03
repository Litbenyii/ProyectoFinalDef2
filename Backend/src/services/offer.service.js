const pool = require("../config/db");

async function createOffer(data, userId) {
  // Mapeo: api.js envía 'details', la DB usa 'description'
  const { title, company, location, hours, modality, details, description } = data;
  const finalDescription = details || description;

  if (!title || !company || !finalDescription) {
    throw new Error("Faltan campos obligatorios");
  }

  const result = await pool.query(
    `INSERT INTO offers (title, company, location, hours, modality, description, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [title, company, location, hours || 0, modality, finalDescription, userId]
  );
  return result.rows[0];
}

async function listAllOffers() {
  const res = await pool.query(`
    SELECT *
    FROM offers
    ORDER BY created_at DESC
  `);
  return res.rows;
}

async function listActiveOffers() {
  const res = await pool.query(`
    SELECT *
    FROM offers
    ORDER BY created_at DESC
  `);
  return res.rows;
}

async function deactivateOffer(id) {
  return await pool.query("DELETE FROM offers WHERE id = $1", [id]);
}

module.exports = { createOffer, listAllOffers, deactivateOffer, listActiveOffers };