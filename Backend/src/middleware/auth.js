const { verifyToken } = require("../services/auth.service");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = await verifyToken(token);

    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    console.error("Error en authMiddleware:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

//solo coordinador
function requireCoordination(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }
  if (req.user.role !== "COORDINATION") {
    return res
      .status(403)
      .json({ message: "Acceso restringido a coordinación" });
  }
  next();
}

//solo estaudiante
function requireStudent(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }
  if (req.user.role !== "STUDENT") {
    return res
      .status(403)
      .json({ message: "Acceso restringido a estudiantes" });
  }
  next();
}

module.exports = {
  authMiddleware,
  requireCoordination,
  requireStudent,
};
