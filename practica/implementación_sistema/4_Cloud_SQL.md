# 🗄️ Guía 4 – Cloud SQL: Bases de Datos para Autenticación y Auditoría (100% Web)

**Objetivo:** Crear una instancia de Cloud SQL con dos bases de datos:
- Una para el servicio de autenticación (`auth_service`)
- Otra para el log de auditoría de notificaciones (`audit_notifs`)

Configurar el acceso privado desde VMs, Cloud Run y Cloud Functions dentro de la VPC, **usando solo la consola web de GCP**.

---

## 📌 Paso 1: Crear instancia de Cloud SQL (PostgreSQL)

1. Ve a **SQL > Create Instance** en la consola web.
2. Selecciona **PostgreSQL** como tipo de base de datos.
3. Completa los datos básicos:
   - **Instance ID:** `sql-evaluador`
   - **Root password:** Elige una segura
   - **Region:** `us-central1`
   - **Zone availability:** `Single zone`
   - **Machine type:** `db-f1-micro` o similar
   - **Storage:** 10 GB
4. Haz clic en **Create** y espera a que finalice la creación.

---

## 📌 Paso 2: Crear las bases de datos

1. En la instancia creada, ve a la pestaña **Databases**.
2. Haz clic en **Create Database** y crea:
   - `auth_service`
   - `audit_notifs`

---

## 📌 Paso 3: Configurar acceso privado (VPC)

1. En la instancia, ve a la pestaña **Connections**.
2. En **Network** → **Private IP**, haz clic en **Set up**.
3. Selecciona la VPC `vpc-evaluador` y la región correspondiente.
4. Habilita el acceso por IP privada.

> 💡 Esto es obligatorio para que las VMs, Cloud Run y Cloud Functions accedan directamente sin exponer la instancia a internet.

---

## 📌 Paso 4: Crear usuario de aplicación (opcional pero recomendado)

1. Ve a la pestaña **Users**.
2. Haz clic en **Create User**.
3. Crea un usuario (ej: `appuser`) con su contraseña.
4. Este usuario será usado por el backend y funciones (evita usar root).

---

## 📌 Paso 5: Permitir acceso a servicios

Asegúrate de que los servicios que deben conectarse cumplan con:
- Estar dentro de la misma VPC
- Tener el permiso **Cloud SQL Client**

### A. VMs backend
- Da permisos a la cuenta de servicio de la VM (desde IAM & Admin > Service Accounts > Otorgar rol Cloud SQL Client).

### B. Cloud Run (auth-service)
- Al desplegar, agrega conexión de VPC Connector si usas IP privada.
- Si accedes por IP pública con lista blanca, basta el rol Cloud SQL Client.

### C. Cloud Functions
- Al crear funciones, especifica conexión VPC con el conector y otorga el rol de acceso.

---

## ✅ Prueba y cierre

- Verifica las bases de datos desde la consola web de Cloud SQL.
- Si necesitas probar conexión, usa la consola SQL integrada o crea una VM temporal desde la web.
- Revisa los logs y métricas desde la consola web.

---

## 🧩 Extras sugeridos

- Habilitar backups automáticos
- Configurar alertas de uso y seguridad
- Probar restauración desde backup

---

## ✅ Fin del flujo principal

¡Tu base de datos Cloud SQL está lista y segura, sin instalar nada en tu PC!

➡️ Continúa con la siguiente guía para desplegar las Cloud Functions.

---

## ⚙️ Opción avanzada: Validación de usuarios en el login usando Cloud SQL (opcional)

Por defecto, el servicio de autenticación usa credenciales fijas para simplificar el flujo. Si quieres un escenario más realista, puedes crear una tabla de usuarios en Cloud SQL y modificar el código del auth-service para validar contra la base de datos.

### 1. Crear la tabla de usuarios

En la base de datos `auth_service`, ejecuta desde la consola SQL web:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL -- Idealmente, almacena hashes
);

INSERT INTO users (username, password) VALUES ('demo', 'demo123');
```

### 2. Modificar el código del auth-service (Node.js)

Agrega la dependencia `pg` en `package.json`:
```json
"pg": "^8.11.1"
```

Ejemplo de conexión y validación en `src/index.js`:
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

app.post('/login', async (req, res) => {
  const { user, pass } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username=$1 AND password=$2', [user, pass]);
    if (result.rows.length > 0) {
      const token = sign({ user });
      return res.json({ token });
    }
    res.status(401).json({ error: 'Credenciales inválidas' });
  } catch (err) {
    res.status(500).json({ error: 'Error de servidor' });
  }
});
```

> ⚠️ En producción, almacena contraseñas como hashes y nunca en texto plano.

### 3. Variables de entorno necesarias

Al desplegar en Cloud Run, agrega estas variables de entorno:
- `DB_USER`: usuario de la base de datos (ej: `appuser`)
- `DB_PASS`: contraseña
- `DB_HOST`: IP privada de la instancia Cloud SQL
- `DB_NAME`: `auth_service`

### 4. Conexión segura

- Usa el conector de VPC si la instancia solo tiene IP privada.
- Otorga el rol **Cloud SQL Client** a la cuenta de servicio del auth-service.

---

Así puedes tener un login realista validando usuarios desde Cloud SQL, manteniendo la opción simple para pruebas y la avanzada para escenarios reales.