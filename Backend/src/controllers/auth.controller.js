const { login } = require("../services/auth.service");

async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

module.exports = { loginController };
