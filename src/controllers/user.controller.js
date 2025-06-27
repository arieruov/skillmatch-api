import { supabase } from "../config/supabase.js";

export const getUserData = async (req, res) => {
  try {
    const id = req.user.id;

    if (!id) {
      res
        .status(400)
        .json({ error: "Servidor: Es necesario el id del usuario" });
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("id, username, email, account_type")
      .eq("id", id)
      .single();

    if (error) {
      res.status(400).json({
        error: `Servidor: Error al extraer la informacion del usuario ${error}`,
      });
    }

    res.status(200).json({ userData });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Servidor: Error interno del servidor: ${err}` });
  }
};
