const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");
const config = require("../config/env");

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      student: true,
    },
  });

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Credenciales inválidas");
  }

  const payload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  };

  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  const baseUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  if (user.role === "STUDENT" && user.student) {
    baseUser.studentId = user.student.id;
    baseUser.rut = user.student.rut;
    baseUser.career = user.student.career;
  }

  return { token, user: baseUser };
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

module.exports = {
  login,
  verifyToken,
};
