# 🔐 Guía 3 – Cloud Run: Servicio de Autenticación JWT (100% Web)

**Objetivo:** Desplegar un microservicio de autenticación en Cloud Run que emita y valide tokens JWT. Configurarlo para que solo cuentas autorizadas (IAM) puedan invocar sus endpoints. **Todo desde la consola web de GCP.**

---

## 📁 Estructura del AuthService (Node.js + Docker)

```bash
auth-service/
├── src/
│   ├── index.js
│   └── jwthelper.js
├── package.json
└── Dockerfile
```

---

### 🧩 src/jwthelper.js – Lógica JWT

```javascript
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "supersecreto";

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}

function verify(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { sign, verify };
```

---

### 🧩 src/index.js – Endpoints de Auth

```javascript
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
```

---

### 🐳 Dockerfile

```dockerfile
# 1. Construir imagen
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY src ./src

# 2. Imagen final
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app /app
ENV PORT=8080
ENV JWT_SECRET="supersecreto"   # Reemplazar en deploy con Secret Manager o variable
CMD ["node", "src/index.js"]
```

---

### 📦 package.json

```json
{
  "name": "auth-service",
  "version": "1.0.0",
  "main": "src/index.js",
  "dependencies": {
    "body-parser": "^1.20.2",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0"
  }
}
```

---

## 🚀 Paso 1: Construir y subir la imagen a Container Registry

1. **Prepara tu código y Dockerfile en tu equipo local.**
2. Entra a la consola web de GCP y ve a **Container Registry** o **Artifact Registry**.
3. Haz clic en **Subir imagen** y sigue el asistente para subir tu imagen Docker (`auth-service`).
   - Si no tienes la imagen construida, puedes usar Cloud Build desde la web:
     - Ve a **Cloud Build > Triggers** y crea un trigger para construir la imagen desde tu repositorio.
     - O usa la opción "Build with Cloud Build" en el menú de Container Registry.
4. Asegúrate de que la imagen esté disponible en `gcr.io/<PROJECT>/auth-service:latest` o similar.

---

## 🚀 Paso 2: Desplegar en Cloud Run (desde la web)

1. Ve a **Cloud Run** en la consola web de GCP.
2. Haz clic en **Create Service**.
3. Configura:
   - **Nombre:** auth-service
   - **Región:** us-central1 (o la que prefieras)
   - **Imagen:** Selecciona la imagen subida en el paso anterior
   - **Variables de entorno:**
     - `JWT_SECRET` (puedes usar Secret Manager para mayor seguridad)
   - **Memoria:** 512Mi
   - **Timeout:** 60s
   - **Permitir tráfico no autenticado:** **NO** (desactiva la casilla para forzar IAM)
4. Haz clic en **Create** para desplegar el servicio.

---

## 🛡️ Paso 3: Configurar IAM (desde la web)

1. Ve a **Cloud Run > auth-service > Permissions**.
2. Haz clic en **Add Principal**.
3. Agrega el rol **Cloud Run Invoker** a:
   - La cuenta de servicio que usarán las VMs/backend.
   - La cuenta de servicio de Cloud Functions (si llama al auth).
   - Cualquier otro cliente (p.ej. tu usuario) para pruebas.

---

## ✅ Prueba y cierre

- Prueba el endpoint `/login` y `/validate` desde [Postman Web](https://web.postman.co/) o el navegador.
- Si hay errores, revisa los logs en Cloud Run desde la consola web (**Logging > Logs Explorer**).
- Puedes ver métricas y monitoreo en Cloud Run desde la consola web.

---

## 🧩 Extras sugeridos

- Usar Secret Manager para el secreto JWT
- Proteger endpoints con políticas IAM más finas
- Habilitar Cloud Audit Logs para trazabilidad

---

## ✅ Fin del flujo principal

¡Tu servicio de autenticación ya está corriendo en GCP, sin instalar nada en tu PC!

➡️ Continúa con la siguiente guía para desplegar Cloud SQL.

---
