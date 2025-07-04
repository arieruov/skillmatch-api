import bcrypt from "bcrypt";
import { supabase } from "../config/supabase.js";

const getUserData = async (req, res) => {
  try {
    const id = req.user.id;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Servidor: Es necesario el id del usuario" });
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("id, username, email, account_type")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(400).json({
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

const updateUserData = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const id = req.user.id;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Servidor: Es necesario el id del usuario" });
    }

    // Verificar si el email ya existe y pertenece a otro usuario
    const { data: existingUser, error: emailError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", id)
      .single();

    if (emailError && emailError.code !== "PGRST116") {
      // PGRST116: No rows found, es aceptable
      return res.status(400).json({
        error: `Servidor: Error al verificar el email: ${emailError.message}`,
      });
    }

    if (existingUser) {
      return res.status(400).json({
        error: "Servidor: El email ya está en uso por otro usuario",
      });
    }

    let updateFields = { username, email };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateFields)
      .eq("id", id)
      .select("id, username, email, account_type")
      .single();

    if (error) {
      return res.status(400).json({
        error: `Servidor: Error al actualizar la información del usuario: ${error.message}`,
      });
    }

    res.status(200).json({ userData: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Servidor: Error interno del servidor" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "Servidor: Es necesario el id del usuario" });
    }

    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) {
      console.log(error);

      return res.status(400).json({
        error: `Servidor: Error al eliminar el usuario`,
      });
    }

    res.status(200).json({ message: "Servidor: Usuario eliminado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Servidor: Error interno del servidor" });
  }
};

export { getUserData, updateUserData, deleteUser };
