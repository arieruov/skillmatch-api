import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

export const generateToken = (payload, expiresIn = "10d") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};
