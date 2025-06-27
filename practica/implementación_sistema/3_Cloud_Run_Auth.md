# 🔐 Guía 3 – Cloud Run: Servicio de Autenticación JWT (100% Web)

**Objetivo:** Desplegar un microservicio de autenticación en Cloud Run que emita y valide tokens JWT. Configurarlo para que solo cuentas autorizadas (IAM) puedan invocar sus endpoints. **Todo desde la consola web de GCP.**

---

## 📦 Imagen pública lista para usar (recomendado)

Para facilitar el despliegue, se ha publicado una imagen Docker ya construida en Docker Hub:

```
ihuerta/cloud-run-auth-demo:latest
```

---

## 🚀 Despliegue del servicio en Cloud Run (solo consola web)

1. Ingresa a la consola de Google Cloud y navega a **Cloud Run**.
2. Haz clic en **Crear servicio**.
3. En la sección **Contenedor**, selecciona "Implementar una imagen de contenedor".
4. En el campo de imagen, ingresa:
   ```
   ihuerta/cloud-run-auth-demo:latest
   ```
5. Configura el resto de opciones según las necesidades del ejercicio (región, autenticación, variables de entorno si aplica).
6. Haz clic en **Crear**.

---

## 🛡️ Configuración de IAM (desde la web)

1. Ve a **Cloud Run > auth-service > Permisos**.
2. Haz clic en **Agregar principal**.
3. Agrega el rol **Cloud Run Invoker** a:
   - La cuenta de servicio que usarán las VMs/backend.
   - La cuenta de servicio de Cloud Functions (si llama al auth).
   - Cualquier otro cliente (p.ej. tu usuario) para pruebas.

---

## ✅ Prueba y cierre

- Accede a la URL pública que te da Cloud Run.
- Realiza pruebas desde el navegador o Postman Web.
- Consulta los logs desde la consola de GCP para verificar el funcionamiento.

---

## 🧩 Extras sugeridos

- Puedes explorar cómo cambiar variables de entorno desde la consola web.
- Usar Secret Manager para el secreto JWT.
- Proteger endpoints con políticas IAM más finas.
- Habilitar Cloud Audit Logs para trazabilidad.
- Consulta la documentación oficial de Cloud Run para más opciones de configuración.

---

¡Tu servicio de autenticación ya está corriendo en GCP, sin instalar nada en tu PC!

➡️ Continúa con la siguiente guía para desplegar Cloud SQL.

---

## ⚙️ Opción avanzada: construir y subir tu propia imagen (opcional)

Si tienes Docker instalado y permisos para subir imágenes a un registro, puedes construir y subir tu propia imagen siguiendo estos pasos:

### 1. Estructura del AuthService (Node.js + Docker)

```bash
auth-service/
├── src/
│   ├── index.js
│   └── jwthelper.js
├── package.json
└── Dockerfile
```

### 2. Código fuente principal

#### src/jwthelper.js
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

#### src/index.js
```javascript
const express = require("express");
const bodyParser = require("body-parser");
const { sign, verify } = require("./jwthelper");
const app = express();

app.use(bodyParser.json());

// POST /login → recibe { user, pass } y devuelve { token }
app.post("/login", (req, res) => {
  const { user, pass } = req.body;
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

#### Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY src ./src

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app /app
ENV PORT=8080
ENV JWT_SECRET="supersecreto"
CMD ["node", "src/index.js"]
```

#### package.json
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

### 3. Construir y subir la imagen

Se coloca el usuario ihuerta como ejemplo, reemplaza con tu usuario de Docker Hub.

```bash

1. Construye la imagen Docker:
   ```bash
   docker build -t ihuerta/cloud-run-auth-demo:latest .
   ```
2. Inicia sesión en Docker Hub:
   ```bash
   docker login
   ```
3. Sube la imagen:
   ```bash
   docker push ihuerta/cloud-run-auth-demo:latest
   ```

Luego, puedes usar tu imagen personalizada en Cloud Run siguiendo los pasos de la sección principal.

---
