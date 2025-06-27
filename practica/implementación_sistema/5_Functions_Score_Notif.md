# 🧮 Guía 5 – Cloud Functions: Score y Notificaciones (100% Web)

**Objetivo:** Crear dos Cloud Functions que representen microservicios aislados:
- `score-evaluator`: Calcula el puntaje crediticio basado en datos almacenados en Cloud Storage.
- `notify-user`: Simula el envío de una notificación y almacena un registro en la base de datos `audit_notifs`.

---

## 📁 Estructura general

```bash
functions/
├── score-evaluator/
│   ├── index.js
│   └── package.json
├── notify-user/
│   ├── index.js
│   └── package.json
```

---

## 📌 Paso 1: Crear y subir el código de las funciones

1. Prepara el código de ambas funciones (`score-evaluator` y `notify-user`) en tu equipo local.
2. Sube cada carpeta como un ZIP a un bucket de Cloud Storage desde la consola web:
   - Ve a **Storage > Browser** y selecciona tu bucket.
   - Haz clic en **Upload files** y sube los ZIPs de cada función.

---

## 📌 Paso 2: Crear la función `score-evaluator` desde la web

1. Ve a **Cloud Functions** en la consola web y haz clic en **Create Function**.
2. Configura:
   - **Nombre:** score-evaluator
   - **Región:** us-central1
   - **Runtime:** Node.js 18
   - **Trigger:** HTTP
   - **Entry point:** scoreEvaluator
   - **Código fuente:** Selecciona **ZIP from Cloud Storage** y elige el ZIP subido
   - **Variables de entorno:** `BUCKET_NAME=score-data-bucket`
   - **VPC connector:** Selecciona el conector `connector-evaluador` si necesitas acceso privado
   - **Permitir tráfico no autenticado:** Sí (o según tu política)
3. Haz clic en **Create** para desplegar la función.

---

## 📌 Paso 3: Crear la función `notify-user` desde la web

1. Ve a **Cloud Functions** y haz clic en **Create Function**.
2. Configura:
   - **Nombre:** notify-user
   - **Región:** us-central1
   - **Runtime:** Node.js 18
   - **Trigger:** HTTP
   - **Entry point:** notifyUser
   - **Código fuente:** Selecciona **ZIP from Cloud Storage** y elige el ZIP subido
   - **Variables de entorno:**
     - `DB_HOST=[IP_PRIVADA]`
     - `DB_USER=appuser`
     - `DB_PASS=[CLAVE]`
   - **VPC connector:** Selecciona el conector `connector-evaluador`
   - **Permitir tráfico no autenticado:** Sí (o según tu política)
3. Haz clic en **Create** para desplegar la función.

---

## 📌 Paso 4: Configurar recursos previos

- **Cloud Storage:** Sube el archivo `tabla_scores.json` al bucket `score-data-bucket`.
- **Cloud SQL:** Asegúrate de tener la tabla `notificaciones` en la base de datos `audit_notifs`:

```sql
CREATE TABLE notificaciones (
  id SERIAL PRIMARY KEY,
  rut TEXT,
  mensaje TEXT,
  fecha TIMESTAMP
);
```

---

## ✅ Prueba y cierre

- Prueba las funciones desde el navegador, [Postman Web](https://web.postman.co/) o el API Explorer de GCP.
- Si hay errores, revisa los logs en Cloud Functions desde la consola web (**Logging > Logs Explorer**).
- Puedes ver métricas y monitoreo en Cloud Functions desde la consola web.

---

## 🧩 Extras sugeridos

- Proteger funciones con autenticación JWT
- Habilitar alertas de error en Cloud Monitoring
- Probar integración entre funciones y backend

---

## ✅ Fin del flujo principal

¡Tus funciones serverless ya están corriendo en GCP, sin instalar nada en tu PC!

➡️ Continúa con la siguiente guía para desplegar el frontend.

---
