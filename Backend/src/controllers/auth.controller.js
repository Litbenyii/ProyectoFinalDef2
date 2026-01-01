const { login } = require("../services/auth.service");

async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Debe ingresar correo y contraseña" });
    }

    const result = await login(email, password);
    return res.json(result);
  } catch (error) {
    console.error("Error en loginController:", error);
    return res.status(401).json({ message: error.message || "Login inválido" });
  }
}

module.exports = {
  loginController,
};
