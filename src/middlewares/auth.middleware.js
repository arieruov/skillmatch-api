import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Header requerido (server)" });
  }

  const token = authHeader.split(" ")[1];

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ error: "Token requerido (server)" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res
      .status(403)
      .json({ error: "Token inválido o expirado (server)" });
  }
};
