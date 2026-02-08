const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({
      error: "No autorizado",
      message: "No se encontró token de autenticación",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Token inválido",
      message: "El token de autenticación no es válido o ha expirado",
    });
  }
};

module.exports = authenticateAdmin;
