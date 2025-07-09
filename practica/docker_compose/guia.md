# Guía paso a paso: Proyecto Docker Compose To-Do App

Esta guía te enseña a crear desde cero un entorno multi-contenedor con Traefik, Nginx (frontend), Node.js (backend) y Postgres (db) para una app de tareas. No copies archivos: ¡créalo todo tú mismo!

---

## 1. Estructura de carpetas

Crea la siguiente estructura:

```
practica/docker_compose/
  ├── backend/
  ├── db/
  ├── html/
```

## 2. Base de datos Postgres

1. Dentro de `db/`, crea un archivo `init.sql` con las tablas:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL
);
CREATE TABLE project (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  done BOOLEAN DEFAULT FALSE
);
```

## 3. Backend Node.js

1. En `backend/`, crea un `package.json`:

```json
{
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5"
  }
}
```

2. Crea un `Dockerfile` en `backend/`:

```
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

3. Crea `index.js` en `backend/` con endpoints para usuarios, proyectos y tareas (CRUD, asignación, borrado, CORS, etc). Usa Express y pg. Ejemplo de inicio:

```js
import express from 'express';
import pkg from 'pg';
import cors from 'cors';
const { Pool } = pkg;
const app = express();
app.use(express.json());
app.use(cors());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// ...endpoints aquí...
app.listen(5000, () => console.log('Backend listening on port 5000'));
```

## 4. Frontend (Nginx + Bootstrap)

1. En `html/`, crea un `index.html` con Bootstrap y JS para consumir la API (usuarios, proyectos, tareas, asignar, borrar, etc). Incluye formularios y listas dinámicas.

## 5. Docker Compose y Traefik

1. En `docker_compose/`, crea `docker-compose.yml`:

```yaml
version: '3.3'
services:
  traefik:
    image: traefik:v2.11
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
    ports:
      - "8080:80"
      - "8081:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - webnet
  web:
    image: nginx:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=PathPrefix(`/`)"
      - "traefik.http.services.web.loadbalancer.server.port=80"
    volumes:
      - ./html:/usr/share/nginx/html
    networks:
      - webnet
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
networks:
  webnet:
volumes:
  db_data:
```

---

## 6. Arrancar el entorno

Desde la carpeta `docker_compose/` ejecuta:

```
docker compose up --build
```

- Accede a la app en: http://localhost:8080
- Traefik dashboard: http://localhost:8081

---

## 7. Consejos
- Modifica los endpoints y frontend según tus necesidades.
- Usa Traefik para exponer los servicios como quieras.
- Puedes añadir más servicios o reglas fácilmente.

¡Listo! Así puedes crear el entorno desde cero, entendiendo cada paso.
