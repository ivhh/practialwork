# 🧪 Guía Práctica: Testing de Aplicaciones con Docker Compose

**Objetivo:** Aprender a implementar y ejecutar tests unitarios y de integración en una aplicación multi-contenedor (backend, base de datos) utilizando Docker Compose y herramientas de testing para Node.js.

**Duración estimada:** 60-75 minutos.

**Entorno:** Google Cloud Shell (no requiere instalación local).

---

### 📚 Conceptos Clave

- **Test Unitario:** Prueba una pequeña parte del código (una función, una clase) de forma aislada, sin dependencias externas como bases de datos o APIs. Se usan "mocks" para simular estas dependencias.
- **Test de Integración:** Prueba cómo interactúan varias partes del sistema. En nuestro caso, probaremos que el backend se comunica correctamente con la base de datos real.
- **Docker Compose:** Herramienta para definir y ejecutar aplicaciones Docker multi-contenedor. Ideal para crear entornos de desarrollo y testing consistentes.

---

### 🚀 Parte 0: Preparación del Entorno (10 minutos)

1.  **Abrir Google Cloud Shell:** Inicia una sesión en [Google Cloud Shell](https://shell.cloud.google.com/).

2.  **Clonar el repositorio:** Clona el proyecto que contiene la solución base.
    ```bash
    git clone https://github.com/ivhh/practialwork.git
    ```

3.  **Navegar al directorio del proyecto:**
    ```bash
    cd practialwork/soluciones/docker_compose/
    ```
4.  **Modificar docker-compose.yml para desarrollo:**
    - Antes de levantar la aplicación, necesitamos añadir mount binds para poder editar código fácilmente. Abre `docker-compose.yml` y modifica el servicio backend:
    ```yaml
      backend:
        build: ./backend
        labels:
          - "traefik.enable=true"
          - "traefik.http.routers.backend.rule=PathPrefix(`/api`)"
          - "traefik.http.services.backend.loadbalancer.server.port=5000"
        networks:
          - webnet
        environment:
          DATABASE_URL: postgres://user:password@db/mydatabase
        depends_on:
          - db
        volumes:
          - ./backend:/app              # Mount bind para editar código
          - /app/node_modules           # Volumen anónimo para proteger node_modules
    ```
    > **Explicación Técnica:** El primer volumen (`./backend:/app`) permite editar archivos localmente. El segundo (`/app/node_modules`) es un volumen anónimo que protege la carpeta `node_modules` instalada durante el build del contenedor, evitando que sea sobrescrita por el mount bind.

5.  **Levantar la aplicación:** Usa Docker Compose para construir y levantar todos los servicios en segundo plano.
    ```bash
    docker-compose up -d --build
    ```

6.  **Verificar que todo funciona:**
    - Abre la vista previa web de Cloud Shell en el puerto `8080`.
    - Deberías ver la aplicación "Gestor de Tareas".
    - Prueba a crear un usuario y un proyecto para confirmar que la comunicación con el backend y la base de datos es correcta.

---

### 🔬 Parte 1: Tests Unitarios para el Backend (25 minutos)

En esta parte, probaremos la lógica del backend sin tocar la base de datos. Usaremos `Jest` como framework de testing y `supertest` para simular peticiones HTTP.

1.  **Instalar dependencias de desarrollo:**
    - Entra al contenedor del backend para instalar las herramientas de testing.
    ```bash
    docker-compose exec backend npm install jest supertest
    ```
    *Esto modificará tu `package.json` y `package-lock.json` locales.*

2.  **Configurar el script de test:**
    - Abre el archivo `backend/package.json` y añade el script de `test` dentro de `"scripts"`:
    ```json
    // filepath: soluciones/docker_compose/backend/package.json
    // ...existing code...
    "type": "module",
    "scripts": {
      "test": "jest"
    },
    "dependencies": {
    // ...existing code...
    ```

3.  **Crear el primer test unitario:**
    - Crea un archivo de test para los endpoints de usuarios.
    ```bash
    touch backend/users.test.js
    ```
    - Pega el siguiente código en `backend/users.test.js`. Fíjate cómo **no usamos una base de datos real**, sino que simulamos la respuesta.
    ```javascript
    // filepath: soluciones/docker_compose/backend/users.test.js
    const express = require('express');
    const request = require('supertest');

    // Creamos una app de Express falsa para el test
    const app = express();
    app.use(express.json());

    // Simulamos (mock) un endpoint
    app.get('/api/users', (req, res) => {
      res.json([{ id: 1, username: 'testuser' }]);
    });

    // Describimos el conjunto de tests
    describe('GET /api/users', () => {
      it('should return a list of users', async () => {
        const response = await request(app).get('/api/users');
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([{ id: 1, username: 'testuser' }]);
      });
    });
    ```

4.  **Ejecutar los tests unitarios:**
    - Desde el directorio `soluciones/docker_compose`, ejecuta el script de test dentro del contenedor del backend.
    ```bash
    docker-compose exec backend npm test
    ```
    - Deberías ver una salida de Jest indicando que el test pasó correctamente.

    > **¡Felicidades!** Acabas de ejecutar tu primer test unitario en un entorno Dockerizado, probando la lógica de un endpoint de forma aislada.

---

### 🔗 Parte 2: Tests de Integración (Backend y DB)

Ahora, vamos a probar que el backend se integra correctamente con la base de datos PostgreSQL que está corriendo en otro contenedor.

1.  **Crear el archivo de test de integración:**
    ```bash
    touch backend/integration.test.js
    ```

2.  **Escribir el test de integración:**
    - Pega el siguiente código en `backend/integration.test.js`. Este test hará una petición HTTP real al servidor que se está ejecutando dentro del contenedor, el cual a su vez se conectará a la base de datos.
    ```javascript
    // filepath: soluciones/docker_compose/backend/integration.test.js
    const request = require('supertest');

    // La URL del backend dentro de la red de Docker
    const API_URL = 'http://localhost:5000';

    describe('Integration Tests: Users and Projects', () => {
      it('should create a new user via PUT /api/users', async () => {
        const newUsername = `user_${Date.now()}`;
        
        const response = await request(API_URL)
          .put('/api/users')
          .send({ username: newUsername });

        expect(response.statusCode).toBe(201);
        expect(response.body.username).toBe(newUsername);
      });

      it('should create a new project via PUT /api/projects', async () => {
        const newProjectName = `project_${Date.now()}`;

        const response = await request(API_URL)
          .put('/api/projects')
          .send({ name: newProjectName });

        expect(response.statusCode).toBe(201);
        expect(response.body.name).toBe(newProjectName);
      });
    });
    ```
    *Nota: Usamos `Date.now()` para asegurar que cada ejecución del test use datos únicos y no falle por duplicados.*

3.  **Ejecutar los tests (unitarios y de integración):**
    - Jest ejecutará automáticamente todos los archivos `.test.js`.
    ```bash
    docker-compose exec backend npm test
    ```
    - Verás que ahora se ejecutan 3 tests y todos pasan. Los tests de integración han creado datos reales en tu base de datos.

4.  **Verificar los datos (Opcional):**
    - Vuelve a la vista previa web en el puerto `8080`.
    - Refresca la página. Verás el nuevo usuario y proyecto creados por el test de integración.

---

### 🌐 Parte 3: Test de Integración entre Microservicios (30 minutos)

Esta es la prueba más completa. Verificaremos que el `backend` principal se comunica correctamente con un nuevo microservicio (`availability_validator`) antes de escribir en la base de datos.

#### 3.1. Crear el Microservicio `availability_validator`

1.  **Crear la estructura de carpetas y archivos:**
    ```bash
    # Desde la carpeta 'soluciones/docker_compose'
    mkdir -p availability_validator
    touch availability_validator/index.js availability_validator/package.json availability_validator/Dockerfile
    ```

2.  **Definir `availability_validator/package.json`:**
    ```json
    // filepath: soluciones/docker_compose/availability_validator/package.json
    {
      "name": "availability-validator",
      "version": "1.0.0",
      "type": "module",
      "main": "index.js",
      "scripts": {
        "start": "node index.js"
      },
      "dependencies": {
        "express": "^4.18.2"
      }
    }
    ```

3.  **Crear el `availability_validator/Dockerfile`:**
    ```dockerfile
    // filepath: soluciones/docker_compose/availability_validator/Dockerfile
    FROM node:20-alpine
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    EXPOSE 5001
    CMD ["npm", "start"]
    ```

4.  **Implementar la lógica en `availability_validator/index.js`:**
    Este servicio simplemente simulará si un usuario está disponible.

    ```javascript
    // filepath: soluciones/docker_compose/availability_validator/index.js
    import express from 'express';
    const app = express();
    app.use(express.json());
    const PORT = 5001;

    app.post('/validate', (req, res) => {
        const { userId } = req.body;
        console.log(`Validando disponibilidad para el usuario: ${userId}`);

        // Lógica de simulación: el usuario con ID 2 siempre está ocupado.
        if (parseInt(userId, 10) === 2) {
        return res.json({ userId, available: false, reason: "User is on vacation" });
        }
        
        res.json({ userId, available: true });
    });

    app.listen(PORT, () => {
        console.log(`Availability Validator corriendo en el puerto ${PORT}`);
    });
    ```
    > **Nota del Instructor:** Hemos cambiado la lógica para que el usuario con **ID 2** sea el no disponible. Esto lo hacemos para que coincida con nuestro caso de prueba.

#### 3.2. Integrar el Nuevo Servicio

1.  **Añadir el servicio a `docker-compose.yml`:**
    - Reemplaza el contenido de tu `soluciones/docker_compose/docker-compose.yml` con esta versión final. Define todos los servicios, incluyendo el nuevo validador, y asegura que las dependencias y redes son correctas.

    ```yaml
    # filepath: soluciones/docker_compose/docker-compose.yml
    version: '3.3'

    services:
      traefik:
        image: traefik:v2.11
        command:
          - "--api.insecure=true"
          - "--providers.docker=true"
          - "--entrypoints.web.address=:80"
        ports:
          - "8080:80"      # Puerto para el tráfico web
          - "8081:8080"    # Puerto para el dashboard de Traefik
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock:ro
        networks:
          - webnet

      web:
        image: nginx:latest
        volumes:
          - ./html:/usr/share/nginx/html:ro
        networks:
          - webnet
        labels:
          - "traefik.enable=true"
          - "traefik.http.routers.web.rule=PathPrefix(`/`)"
          - "traefik.http.routers.web.service=web"
          - "traefik.http.services.web.loadbalancer.server.port=80"

      db:
        image: postgres:latest
        environment:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: mydatabase
        volumes:
          - db_data:/var/lib/postgresql/data
          - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
        networks:
          - webnet

      backend:
        build: ./backend
        environment:
          DATABASE_URL: postgres://user:password@db/mydatabase
        networks:
          - webnet
        depends_on:
          - db
          - availability_validator # Dependencia del nuevo servicio
        labels:
          - "traefik.enable=true"
          - "traefik.http.routers.backend.rule=PathPrefix(`/api`)"
          - "traefik.http.routers.backend.service=backend"
          - "traefik.http.services.backend.loadbalancer.server.port=5000"
        volumes:
          - ./backend:/app              # Mount bind para editar código
          - /app/node_modules           # Volumen anónimo para proteger node_modules

      availability_validator:
        build: ./availability_validator
        networks:
          - webnet
        volumes:
          - ./availability_validator:/app
          - /app/node_modules           # Volumen anónimo para proteger node_modules
        # No necesita labels de Traefik, es un servicio interno

    networks:
      webnet:

    volumes:
      db_data:
    ```

2.  **Modificar el backend principal para que llame al validador:**
    - Primero, instala `axios` para hacer peticiones HTTP.
    ```bash
    docker-compose exec backend npm install axios
    ```
    - Luego, modifica el endpoint de asignación de tareas en `backend/index.js`.
    ```javascript
    // filepath: soluciones/docker_compose/backend/index.js
    // ... (importaciones existentes) ...
    import axios from 'axios';

    // ... (código existente) ...

    // Asignar usuario a un task
    app.patch('/api/tasks/:id/assign', async (req, res) => {
      const { id } = req.params;
      const { assigned_to } = req.body;

      try {
        // 1. Llamar al microservicio de validación
        const validationResponse = await axios.post('http://availability_validator:5001/validate', { userId: assigned_to });
        
        if (!validationResponse.data.available) {
          return res.status(409).json({ error: 'Usuario no disponible', details: validationResponse.data.reason });
        }

        // 2. Si está disponible, asignar la tarea
        const { rows } = await pool.query(
          'UPDATE tasks SET assigned_to = $1 WHERE id = $2 RETURNING *',
          [assigned_to, id]
        );
        res.json(rows[0]);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al asignar tarea' });
      }
    });

    // ... (resto del código) ...
    ```

#### 3.3. Crear el Test de Integración entre Servicios

1.  **Reiniciar Docker Compose con el nuevo servicio:**
    ```bash
    docker-compose down
    docker-compose up -d --build
    ```

2.  **Crear el archivo de test para la comunicación entre servicios:**
    ```bash
    touch backend/inter_service.test.js
    ```

3.  **Escribir el test de integración entre servicios:**
    - Pega el siguiente código en `backend/inter_service.test.js`. Este test es más robusto: crea los datos que necesita para cada caso, evitando depender de IDs fijos.

    ```javascript
    // filepath: soluciones/docker_compose/backend/inter_service.test.js
    const request = require('supertest'); // Importar supertest como un objeto común
    const API_URL = 'http://localhost:5000';

    describe('Inter-Service Integration: Task Assignment', () => {
        let testProject, testTask;

        // Hook `beforeAll`: Se ejecuta una vez antes de todos los tests de este bloque.
        // Lo usamos para crear un proyecto y una tarea que serán compartidos entre los tests.
        // Esto evita repetir código de creación en cada `it`.
        beforeAll(async () => {
        const projectRes = await request(API_URL).put('/api/projects').send({ name: 'project_for_assignment' });
        testProject = projectRes.body;

        const taskRes = await request(API_URL).post(`/api/projects/${testProject.id}/tasks`).send({ title: 'task_to_be_assigned' });
        testTask = taskRes.body;
        });

        it('should successfully assign a task to an available user', async () => {
        // 1. Crear un usuario específico para este test con nombre único basado en timestamp.
        const uniqueUsername = `available_user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const availableUserRes = await request(API_URL).put('/api/users').send({ username: uniqueUsername });
        const availableUser = availableUserRes.body;

        // 2. Intentar asignar la tarea a este usuario.
        const response = await request(API_URL)
            .patch(`/api/tasks/${testTask.id}/assign`)
            .send({ assigned_to: availableUser.id });

        // 3. Verificar que la operación fue exitosa.
        expect(response.statusCode).toBe(200);
        expect(response.body.assigned_to).toBe(availableUser.id);
        });

        it('should fail to assign a task to an unavailable user (ID 2)', async () => {
        // 1. Crear usuarios únicos para este test.
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 9);
        
        await request(API_URL).put('/api/users').send({ username: `user_1_${timestamp}_${randomStr}` });
        await request(API_URL).put('/api/users').send({ username: `user_2_${timestamp}_${randomStr}` });

        // 2. Intentar asignar la tarea al usuario con ID 2.
        const response = await request(API_URL)
            .patch(`/api/tasks/${testTask.id}/assign`)
            .send({ assigned_to: 2 }); // El validador rechazará al usuario con ID 2

        // 3. Verificar que la operación fue rechazada correctamente.
        expect(response.statusCode).toBe(409); // 409 Conflict
        expect(response.body.error).toBe('Usuario no disponible');
        });
    });
    ```

4.  **Ejecutar todos los tests:**
    ```bash
    docker-compose exec backend npm test
    ```
    - Ahora verás que todos los tests, incluyendo los nuevos de integración entre servicios, se ejecutan y pasan correctamente.

---
### 🧹 Parte 4: Conclusión y Limpieza (5 minutos)

- **Resumen:** Has aprendido a configurar un entorno de testing para una aplicación Dockerizada, separando tests unitarios (rápidos y aislados) de tests de integración (completos y realistas). Esta es una práctica fundamental en el desarrollo de software moderno.

- **Limpieza:** Para detener y eliminar los contenedores, volúmenes y redes creados, ejecuta:
    ```bash
    docker-compose down -v
    ```
    *El flag `-v` es importante para eliminar el volumen de la base de datos y asegurar un entorno limpio para la próxima vez.*