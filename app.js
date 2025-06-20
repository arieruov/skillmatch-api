import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Carga las variables de entorno del archivo .env
dotenv.config();

// Inicializa la app de Express
const app = express();

// Aplica los middlewares necesarios
app.use(cors());
app.use(express.json());

// Desestructura las variables de entorno para usarlas directamente
const { PORT, SUPABASE_URL, SUPABASE_KEY } = process.env;

// Crea el cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.post("/register", async (req, res) => {
  try {
    const { username, email, password, accountType } = req.body;

    // Validamos que se recibieron todos los campos del formulario
    if (!username || !email || !password || !accountType) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Revisamos que el usuario exista en la base de datos
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    // Respondemos con un mensaje de error en caso de que el usuario SI exista en la base de datos
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "El usuario ya existe en la base de datos" });
    }

    // En caso de que ocurra un error al recuperar la informacion de la base de datos respondemos con un mensaje de error
    if (userError && userError.code !== "PGRST116") {
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    // Hasheamos la contraseña con 10 rondas de salt para mejorar la seguridad de las cuentas
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertamos los datos del usuario en la base de datos
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
      .select("id, username, email, account-type")
      .single();

    // Sì la base de datos nos devuelve un error respondemos con un mensaje de error
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Todo salio bien con el registro del usuario, por lo que respondemos al cliente con un mensaje y los datos que se registraron
    // TODO: para el producto final hay que eliminar que el servidor devuelva los datos del usuario
    res
      .status(201)
      .json({ message: "Usuario registrado exitosamente", userData: data });
  } catch (err) {
    // Algo salio mal al intentar registrar el usuario
    res.status(500).json({ error: `Error interno del servidor: ${err}` });
  }
});

app.get("/login", async (req, res) => {
  console.log("Se recivio la peticion");
  try {
    const { email, password } = req.body;

    // Validamos que se recibieron todos los campos del formulario
    if (!email || !password) {
      console.log("Error: Faltan campos requeridos");
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Revisamos que el usuario exista en la base de datos y recuperamos su contraseña para validarla
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id, username, email, password")
      .eq("email", email)
      .single();

    // En caso de que ocurra un error al recuperar la informacion de la base de datos respondemos con un mensaje de error
    if (userError && userError.code !== "PGRST116") {
      console.log("Error al recuperar usuario de la base de datos:", userError);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    // Respondemos con un mensaje de error en caso de que el usuario NO exista en la base de datos
    if (!existingUser) {
      console.log("Error: El usuario no existe en la base de datos");
      return res
        .status(400)
        .json({ error: "El usuario no existe en la base de datos" });
    }

    // Validamos que las contraseñas coincidan
    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    // Sì las contraseñas no coinciden respondemos con un mensaje de error
    if (!passwordMatch) {
      console.log("Error: Las contraseñas no coinciden");
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    res.status(200).json({
      message: "Usuario validado",
      userData: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      },
    });
  } catch (err) {
    // Algo salio mal al intentar acceder a la informacion del usuario
    res.status(500).json({ error: `Error interno del servidor: ${err}` });
  }
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------

// Test connection (GET method)
app.get("/", (req, res) => {
  console.log("Conexion recibida a la ruta '/'");
  res.json({ message: "Bienvenido a skillmatch-api" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
