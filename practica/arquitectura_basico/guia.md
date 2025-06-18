**Desafío de Arquitectura Cloud Bancaria**

---

**Objetivo:**
Disenar en equipos una arquitectura cloud para un sistema de alertas de transacciones bancarias basado en eventos, aplicando los principios de:
- Alta disponibilidad
- Escalabilidad
- Resiliencia ante fallos
- Patrones modernos: serverless, microservicios, contenedores

---

**Contexto del caso:**
El banco necesita un sistema moderno que procese eventos de transacciones (compras, retiros, pagos) y que:
- Detecte actividades inusuales (fraudes, patrones sospechosos)
- Notifique al cliente en tiempo real (email, push, sms)
- Registre todas las acciones para auditoría
- Escale automáticamente según demanda

---

**Requisitos mínimos del sistema:**
1. **Entrada de eventos:** Por API o cola de eventos (REST, Pub/Sub)
2. **Procesamiento de reglas antifraude:** Análisis simple por ahora
3. **Notificación:** Alerta al cliente ante evento sospechoso
4. **Persistencia:** Registro de eventos en base de datos para auditoría
5. **Visualización:** Estadísticas básicas de transacciones sospechosas

---

**Servicios sugeridos por proveedor:**

| Categoría          | AWS                      | GCP                        | Azure                          |
|--------------------|--------------------------|----------------------------|--------------------------------|
| Entrada (eventos)  | API Gateway + SNS        | Cloud Endpoints + Pub/Sub  | API Management + Event Grid    |
| Computo flexible   | Lambda                   | Cloud Functions            | Azure Functions                |
| Procesamiento      | Step Functions, Fargate  | Workflows, Cloud Run       | Logic Apps, Container Apps     |
| Almacenamiento     | DynamoDB / S3            | Firestore / Cloud Storage  | Cosmos DB / Blob Storage       |
| Notificaciones     | SES / SNS                | Firebase / SendGrid        | Notification Hub / SendGrid    |
| Dashboard          | QuickSight / Grafana     | Looker / Data Studio       | Power BI                       |

---

**Instrucciones para los equipos:**
1. Tiempo para diseño: 25 minutos
2. Usen papel, pizarra o una herramienta online (FigJam, Excalidraw, etc.)
3. Elijan el proveedor cloud que prefieran (pueden mezclar)
4. Definan:
   - Flujo de datos completo
   - Servicios que usarán
   - Justificación de las decisiones (alta disponibilidad, resiliencia, etc.)
5. Prepárense para presentar su diseño en 3–5 minutos

---

**Tips de ayuda:**
- *Serverless*: para ejecución de lógica en respuesta a eventos sin preocuparse de servidores
- *Contenedores*: para APIs o servicios personalizados empaquetados
- *Colas/Eventos*: para desacoplar componentes
- *Bases NoSQL*: cuando se requiere escalar horizontalmente

---

**Bonus:**
Puedes asignar patrones por equipo:
- Equipo A: Solo serverless
- Equipo B: Microservicios con contenedores
- Equipo C: Híbrida (VMs + serverless + contenedores)
- Equipo D: Multi-región o tolerancia a fallas

