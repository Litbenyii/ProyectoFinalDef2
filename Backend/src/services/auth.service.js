const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//LOGIN
async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email y contraseña son obligatorios");
  }

  const result = await pool.query(
    "SELECT id, email, password, role FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Credenciales inválidas");
  }

  const user = result.rows[0];

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

//VERIFY TOKEN
function verifyToken(token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

module.exports = {
  login,
  verifyToken,
};
