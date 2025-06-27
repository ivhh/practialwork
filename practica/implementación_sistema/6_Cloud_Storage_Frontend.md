# 🌐 Guía 6 – Frontend Estático con Cloud Storage + CDN (100% Web)

**Objetivo:** Desplegar un frontend estático como punto de entrada de la aplicación, almacenado en Cloud Storage y distribuido globalmente a través de Cloud CDN. **Todo desde la consola web de GCP.**

---

## 📁 Estructura del sitio

```bash
frontend/
└── index.html
```

---

## 🧩 index.html – Frontend básico

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Evaluador de Crédito</title>
</head>
<body>
  <h1>Simulador de Evaluación de Crédito</h1>
  <form id="score-form">
    <input name="rut" placeholder="RUT" required>
    <input name="ingresos" type="number" placeholder="Ingresos" required>
    <button type="submit">Calcular Puntaje</button>
  </form>
  <pre id="resultado"></pre>
  <script>
    const form = document.getElementById("score-form");
    const resultado = document.getElementById("resultado");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        rut: form.rut.value,
        ingresos: parseInt(form.ingresos.value, 10)
      };
      try {
        const res = await fetch("https://REGION-PROJECT.cloudfunctions.net/score-evaluator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const json = await res.json();
        resultado.textContent = JSON.stringify(json, null, 2);
      } catch (err) {
        resultado.textContent = "Error al calcular score";
      }
    });
  </script>
</body>
</html>
```

---

## 📌 Paso 1: Crear bucket en Cloud Storage (desde la web)

1. Ve a **Storage > Browser** en la consola web de GCP.
2. Haz clic en **Create bucket**.
3. Asigna un nombre (ej: `frontend-evaluador`) y selecciona la región.
4. Configura el bucket como público o restringido según tu política de acceso.
5. Haz clic en **Create**.

---

## 📌 Paso 2: Subir archivos al bucket (desde la web)

1. Entra al bucket creado.
2. Haz clic en **Upload files** y selecciona tu `index.html` (y otros archivos estáticos si tienes).
3. (Opcional) Ve a la pestaña **Website configuration** y define `index.html` como página de inicio.

---

## 📌 Paso 3: Configurar acceso y distribución global con Cloud CDN (desde la web)

1. Ve a **Cloud CDN** en la consola web.
2. Haz clic en **Create origin** o ve a **Load balancing** para crear un balanceador HTTP(S) con backend estático.
3. Selecciona como origen el bucket `frontend-evaluador`.
4. Activa caché y HTTP/HTTPS.
5. Asigna una IP pública global.
6. (Opcional) Apunta tu dominio personalizado a la IP asignada.
7. Puedes habilitar CDN directamente desde el balanceador para mayor control y rendimiento.

---

## ✅ Prueba y cierre

- Accede a la URL pública de tu frontend (por ejemplo, `https://storage.googleapis.com/frontend-evaluador/index.html` o la URL de tu dominio/CDN).
- Completa el formulario y verifica que recibes el puntaje desde el backend.
- Si hay errores, revisa los logs de Cloud Functions y Cloud Run desde la consola web (**Logging > Logs Explorer**).
- Puedes usar [Postman Web](https://web.postman.co/) para probar los endpoints de backend si lo deseas.

---

## 🧩 Extras sugeridos

- Agregar autenticación con JWT (desde Cloud Run)
- Validar token en el backend antes de ejecutar acciones sensibles
- Agregar logging visual para monitoreo de funciones

---

## ✅ Fin del flujo principal

¡Tu app full-stack de evaluación de crédito ya está corriendo en GCP, sin necesidad de instalar nada en tu PC!

➡️ Puedes ahora agregar observabilidad, seguridad extra (WAF con Cloud Armor) o automatizar el despliegue con Terraform.

---