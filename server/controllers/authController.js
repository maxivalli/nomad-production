const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { loginSchema } = require("../validators/schemas");

const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Datos inválidos",
        message: error.details[0].message,
      });
    }

    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM admins WHERE username = $1",
      [username],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Usuario o contraseña incorrectos",
      });
    }

    const admin = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Usuario o contraseña incorrectos",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        admin: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Autenticación exitosa",
      user: { username: admin.username },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo procesar la autenticación",
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({
    success: true,
    message: "Sesión cerrada exitosamente",
  });
};

const verify = (req, res) => {
  res.json({
    authenticated: true,
    user: { username: req.admin.username },
  });
};

module.exports = {
  login,
  logout,
  verify,
};
