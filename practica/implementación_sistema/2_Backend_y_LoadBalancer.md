# ⚙️ Guía 2 – Backend y Load Balancer (100% Web)

> **IMPORTANTE:** Esta guía está diseñada para realizarse **exclusivamente desde la consola web de Google Cloud Platform**. No utilices comandos de terminal ni instales software localmente. Todo el flujo es web-only.

**Objetivo:** Crear dos instancias de backend en Compute Engine (puertos 3000 y 3001), configuradas como instancias *stateless*. Luego se conectarán a un Load Balancer HTTP(S) para simular alta disponibilidad. **Todo desde la consola web de GCP.**

---

## 📁 Estructura del Backend (Node.js)

```text
backend/
├── index.js
├── config.json      # Configurable en tiempo de despliegue
├── package.json
```

---

## 🧩 index.js – Código base del backend

```javascript
const express = require("express");
const fs = require("fs");
const app = express();

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const PORT = config.port || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(403).send("Forbidden: JWT required");
});

app.listen(PORT, () => {
  console.log(`Evaluador backend corriendo en puerto ${PORT}`);
});
```

---

## 📦 package.json

```json
{
  "name": "evaluador-backend",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node index.js"
  }
}
```

---

## ⚙️ config.json (ejemplo para puerto 3000)

```json
{
  "port": 3000
}
```

---

## 🛠️ Paso 1: Subir el código y el startup script a un bucket (solo web)

1. **Prepara tu código backend y el archivo `startup.sh` en tu equipo local.**
   - El `startup.sh` debe contener la lógica de instalación y arranque (ver ejemplo anterior).
2. **Entra a la consola web de GCP** y ve a **Storage > Browser**.
3. **Crea un bucket** (si no tienes uno) y súbelo ahí:
   - Sube el archivo `startup.sh`.
   - Sube tu código backend (puedes subirlo como .zip si lo deseas para referencia, pero solo el script es necesario para el arranque).
4. **Haz público el archivo `startup.sh`** o configura los permisos para que Compute Engine pueda accederlo.

> **Tip:** No necesitas instalar gsutil ni usar comandos locales. Todo se hace desde la web.

---

## 🚀 Paso 2: Crear las instancias de backend desde la web

1. Ve a **Compute Engine > VM Instances** y haz clic en **Create Instance**.
2. Configura:
   - **Nombre:** backend-1
   - **Zona:** us-central1-a (o la que prefieras)
   - **Tipo de máquina:** e2-micro
   - **Imagen:** Debian 11
   - **Red:** vpc-evaluador, subred: subnet-central
3. En la sección **Management > Automation > Startup script URL**, pon la URL de tu archivo en el bucket (ejemplo: `gs://TU_BUCKET/startup.sh`).
4. En **Custom metadata**, agrega una clave `port` y valor `3000`.
5. En **Tags**, pon `backend`.
6. Crea la instancia.
7. Repite el proceso para **backend-2** (en otra zona, por ejemplo us-central1-b) y pon el puerto `3001` en el metadata.

---

## 🌐 Paso 3: Crear el Load Balancer HTTP desde la web

1. Ve a **Network Services > Load balancing**.
2. Haz clic en **Create Load Balancer** > **HTTP(S) Load Balancing** > *Start configuration*.
3. Selecciona **From Internet to my VMs**.
4. Asigna nombre: `lb-evaluador`.
5. **Backend configuration:**
   - Crea un grupo de instancias (puede ser manual, sin autoscaling).
   - Agrega ambas VMs al grupo (una por grupo si lo prefieres).
   - Configura health check HTTP en puerto 3000 o 3001.
6. **Frontend configuration:**
   - Crea una IP pública (o usa una existente).
   - Puerto: 80 (HTTP)
7. Revisa y crea el balanceador.

---

## ✅ Prueba y cierre

- Accede a la IP pública del Load Balancer desde tu navegador.
- Verifica que ves el mensaje 403 Forbidden.
- Si hay errores, revisa los logs de las VMs desde la consola web (**Logging > Logs Explorer**).
- Puedes usar [Postman Web](https://web.postman.co/) para probar los endpoints si lo deseas.

---

## 🧩 Extras sugeridos

- Agregar health checks personalizados
- Probar balanceo de carga apagando una VM
- Revisar métricas en Cloud Monitoring

---

## 🏁 **Fin del flujo principal**

> ¡Tu backend y balanceador están funcionando en GCP, sin instalar nada en tu PC!

➡️ Continúa con la siguiente guía para desplegar el servicio de autenticación.

---