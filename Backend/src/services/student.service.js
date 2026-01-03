const pool = require("../config/db");
// Usa 'bcrypt' para que coincida con tu auth.service
const bcrypt = require("bcrypt"); 

/**
 * Crea un Usuario y un Estudiante asociado
 * La contraseña inicial son los últimos 5 dígitos del RUT
 */
async function createStudent(data) {
  const { name, rut, email, career } = data;

  if (!name || !rut || !email) {
    throw new Error("Faltan datos obligatorios (Nombre, RUT o Email)");
  }

  // 1. Limpiamos el RUT (quitamos puntos y guion) y sacamos los últimos 5
  const rutLimpio = rut.replace(/[^0-9kK]/g, ""); 
  const password = rutLimpio.slice(-5); 

  if (password.length < 5) {
    throw new Error("El RUT ingresado es muy corto para generar la clave");
  }

  // 2. Encriptamos la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insertar en la tabla 'users'
  const userResult = await pool.query(
    `INSERT INTO users (email, password, role) VALUES ($1, $2, 'STUDENT') RETURNING id`,
    [email, hashedPassword]
  );

  const userId = userResult.rows[0].id;

  // 4. Insertar en la tabla 'students'
  const studentResult = await pool.query(
    `INSERT INTO students (user_id, full_name, rut, career) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, name, rutLimpio, career]
  );

  return {
    student: studentResult.rows[0],
    initialPassword: password // Esto es para el mensaje de éxito en el front
  };
}

async function getStudentByUserId(userId) {
  const result = await pool.query("SELECT * FROM students WHERE user_id = $1", [userId]);
  return result.rows[0] || null;
}

// ESTA PARTE ES VITAL: Si falta, sale el error "is not a function"
module.exports = {
  createStudent,
  getStudentByUserId,
};