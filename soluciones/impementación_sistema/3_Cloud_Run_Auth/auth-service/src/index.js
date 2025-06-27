const express = require("express");
const bodyParser = require("body-parser");
const { sign, verify } = require("./jwthelper");
const app = express();

app.use(bodyParser.json());

// POST /login → recibe { user, pass } y devuelve { token }
app.post("/login", (req, res) => {
  const { user, pass } = req.body;

  // 🔒 Aquí puedes validar contra Cloud SQL (fuera de alcance del MVP)
  if (user === "demo" && pass === "demo123") {
    const token = sign({ user });
    return res.json({ token });
  }
  res.status(401).json({ error: "Credenciales inválidas" });
});

// GET /validate?token=... → valida token
app.get("/validate", (req, res) => {
  const token = req.query.token;
  const payload = verify(token);
  if (payload) return res.json({ valid: true, payload });
  res.status(401).json({ valid: false });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`AuthService corriendo en puerto ${PORT}`);
});