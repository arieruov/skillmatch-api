import bcrypt from "bcrypt";
import { supabase } from "../config/supabase.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, accountType } = req.body;

    if (!username || !email || !password || !accountType) {
      return res
        .status(400)
        .json({ error: "Servidor: Todos los campos son requeridos" });
    }

    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Servidor: El usuario ya existe" });
    }

    if (userError && userError.code !== "PGRST116") {
      return res
        .status(500)
        .json({ error: "Servidor: Error interno del servidor" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          email,
          password: hashedPassword,
          "account-type": accountType,
        },
      ])
      .select("id, username, email, account_type")
      .single();

    if (error) {
      return res.status(400).json({ error: `Servidor: ${error.message}` });
    }

    res.status(201).json({ userData: data });
  } catch (err) {
    res
      .status(500)
      .json({ error: `Servidor: Error interno del servidor ${err}` });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Servidor: Todos los campos son requeridos" });
    }

    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id, email, password")
      .eq("email", email)
      .single();

    if (userError && userError.code !== "PGRST116") {
      return res
        .status(500)
        .json({ error: "Servidor: Error interno del servidor" });
    }

    if (!existingUser) {
      return res.status(400).json({ error: "Servidor: El usuario no existe" });
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: "Servidor: Contraseña incorrecta" });
    }

    const token = generateToken({
      id: existingUser.id,
    });

    res.status(200).json({ token });
  } catch (err) {
    res
      .status(500)
      .json({ error: `Servidor: Error interno del servidor: ${err}` });
  }
};
