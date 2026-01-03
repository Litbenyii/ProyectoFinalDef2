const pool = require("../config/db");
const bcrypt = require("bcrypt");

// Crear estudiante + usuario
async function createStudent(data) {
  const { name, rut, email, career } = data;

  if (!name || !rut || !email) {
    throw new Error("Faltan datos obligatorios");
  }

  const cleanRut = rut.replace(/[^0-9kK]/g, "");
  const password = cleanRut.slice(-5);

  if (password.length < 5) {
    throw new Error("RUT inválido");
  }

  const hashed = await bcrypt.hash(password, 10);

  const userRes = await pool.query(
    `
    INSERT INTO users (email, password, role)
    VALUES ($1, $2, 'STUDENT')
    RETURNING id
    `,
    [email, hashed]
  );

  const studentRes = await pool.query(
    `
    INSERT INTO students (user_id, full_name, rut, career)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [userRes.rows[0].id, name, cleanRut, career || null]
  );

  return {
    student: studentRes.rows[0],
    initialPassword: password,
  };
}

async function getStudentByUserId(userId) {
  const res = await pool.query(
    "SELECT * FROM students WHERE user_id = $1",
    [userId]
  );
  return res.rows[0] || null;
}

module.exports = {
  createStudent,
  getStudentByUserId,
};
