# 🏁 Guía 7 – Cierre y Testeo de la Solución (100% Web)

**Objetivo:** Validar el funcionamiento de toda la arquitectura desplegada, asegurando que los servicios se comunican correctamente y cumplen los requisitos de seguridad y funcionalidad. Todo desde la consola web y herramientas online.

---

## ✅ Checklist de pruebas de ciclo completo

1. **Login y autenticación**
   - Accede al endpoint `/login` del auth-service en Cloud Run usando Postman Web o el navegador.
   - Ingresa credenciales válidas (por defecto: demo/demo123 o las que estén en la base de datos).
   - Verifica que recibes un token JWT válido.

2. **Validación de token**
   - Usa el endpoint `/validate?token=...` para comprobar que el token es aceptado.
   - Prueba con un token inválido y verifica que la respuesta es de error.

3. **Acceso a backend protegido**
   - Realiza una petición al backend (Compute Engine, Cloud Run, etc.) usando el token JWT en el header o query param, según la implementación.
   - Verifica que solo usuarios autenticados pueden acceder.

4. **Operación de negocio y notificación**
   - Ejecuta una operación que dispare una notificación (por ejemplo, una transferencia o acción relevante).
   - Verifica que la función Cloud Function correspondiente se activa y registra el evento en la base de auditoría.

5. **Persistencia y auditoría**
   - Ingresa a Cloud SQL desde la consola web y revisa que los registros de auditoría se almacenan correctamente en la base `audit_notifs`.

6. **Acceso a archivos estáticos**
   - Accede al frontend desplegado en Cloud Storage/Cloud CDN.
   - Realiza el flujo de login y operaciones desde la interfaz web.

7. **Logs y monitoreo**
   - Revisa los logs de cada servicio desde la consola web (Logging > Logs Explorer).
   - Verifica que no hay errores inesperados y que las trazas de auditoría son completas.

---

## 🧩 Extras sugeridos para cierre

- Prueba flujos de error: credenciales inválidas, tokens expirados, acceso no autorizado.
- Revisa métricas de uso y alertas configuradas.
- Realiza un backup y prueba la restauración de Cloud SQL.
- Explora la documentación de GCP para prácticas recomendadas de seguridad y monitoreo.

---

## 🎉 ¡Cierre de la actividad!

Has completado el despliegue y validación de una arquitectura moderna en GCP, usando solo la consola web y servicios gestionados. Tu solución es segura, escalable y auditable.

¡Felicidades! Puedes compartir tus resultados y capturas de pantalla con el equipo o instructores para feedback final.

➡️ Continúa explorando GCP o revisa los extras sugeridos para profundizar aún más.
