import "./config/env.js";
import os from "os";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const { PORT } = process.env;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a skillmatch-api" });
});

app.listen(PORT, () => {
  const interfaces = os.networkInterfaces();
  let localIP = "localhost";
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }

  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`En red local: http://${localIP}:${PORT}`);
});
