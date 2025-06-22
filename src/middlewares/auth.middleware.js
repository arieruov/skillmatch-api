import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Esperamos el formato: "Bearer token"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Agrega los datos del usuario al request
    next(); // Continúa a la siguiente función
  } catch (err) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};
