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
  "name": "backend",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3"
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
const { Pool } = pkg;

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- USERS ---
app.get('/api/users', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users');
  res.json(rows);
});

// Crear usuario
app.put('/api/users', async (req, res) => {
  const { username } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO users (username) VALUES ($1) RETURNING *',
    [username]
  );
  res.status(201).json(rows[0]);
});

// Eliminar usuario
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  res.status(204).end();
});

// --- PROJECTS ---
app.get('/api/projects', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM project');
  res.json(rows);
});

// Crear proyecto
app.put('/api/projects', async (req, res) => {
  const { name } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO project (name) VALUES ($1) RETURNING *',
    [name]
  );
  res.status(201).json(rows[0]);
});

// Eliminar proyecto
app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM project WHERE id = $1', [id]);
  res.status(204).end();
});

// --- TASKS ---
app.get('/api/tasks', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM tasks');
  res.json(rows);
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, project_id, assigned_to } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO tasks (title, description, project_id, assigned_to) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, description, project_id, assigned_to]
  );
  res.status(201).json(rows[0]);
});

// Crear task en un proyecto específico
app.post('/api/projects/:projectId/tasks', async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assigned_to } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO tasks (title, description, project_id, assigned_to) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, description, projectId, assigned_to]
  );
  res.status(201).json(rows[0]);
});

// Cambiar un task de proyecto
app.patch('/api/tasks/:id/project', async (req, res) => {
  const { id } = req.params;
  const { project_id } = req.body;
  const { rows } = await pool.query(
    'UPDATE tasks SET project_id = $1 WHERE id = $2 RETURNING *',
    [project_id, id]
  );
  res.json(rows[0]);
});

// Asignar usuario a un task
app.patch('/api/tasks/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;
  const { rows } = await pool.query(
    'UPDATE tasks SET assigned_to = $1 WHERE id = $2 RETURNING *',
    [assigned_to, id]
  );
  res.json(rows[0]);
});

// Eliminar tarea
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.status(204).end();
});

app.listen(5000, () => {
  console.log('Backend listening on port 5000');
});
```

## 4. Frontend (Nginx + Bootstrap)

1. En `html/`, crea un `index.html` con Bootstrap y JS para consumir la API (usuarios, proyectos, tareas, asignar, borrar, etc). Incluye formularios y listas dinámicas.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Gestor de Tareas - Demo Docker Compose</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background: #f8f9fa; }
    .container { max-width: 800px; margin-top: 40px; }
    .card { margin-bottom: 1.5rem; }
    .form-label { font-weight: 500; }
    .list-group-item { display: flex; justify-content: space-between; align-items: center; }
    .badge { font-size: 0.9em; }
  </style>
</head>
<body>
<div class="container">
  <h1 class="mb-4">Gestor de Tareas</h1>

  <!-- Usuarios -->
  <div class="card">
    <div class="card-header">Usuarios</div>
    <div class="card-body">
      <form id="userForm" class="row g-2 mb-3">
        <div class="col-auto">
          <input type="text" class="form-control" id="username" placeholder="Nombre de usuario" required>
        </div>
        <div class="col-auto">
          <button type="submit" class="btn btn-primary">Crear usuario</button>
        </div>
      </form>
      <ul id="userList" class="list-group"></ul>
    </div>
  </div>

  <!-- Proyectos -->
  <div class="card">
    <div class="card-header">Proyectos</div>
    <div class="card-body">
      <form id="projectForm" class="row g-2 mb-3">
        <div class="col-auto">
          <input type="text" class="form-control" id="projectName" placeholder="Nombre del proyecto" required>
        </div>
        <div class="col-auto">
          <button type="submit" class="btn btn-success">Crear proyecto</button>
        </div>
      </form>
      <ul id="projectList" class="list-group"></ul>
    </div>
  </div>

  <!-- Tareas -->
  <div class="card">
    <div class="card-header">Tareas</div>
    <div class="card-body">
      <form id="taskForm" class="row g-2 mb-3">
        <div class="col-md-3">
          <input type="text" class="form-control" id="taskTitle" placeholder="Título" required>
        </div>
        <div class="col-md-3">
          <input type="text" class="form-control" id="taskDesc" placeholder="Descripción">
        </div>
        <div class="col-md-3">
          <select class="form-select" id="taskProject" required></select>
        </div>
        <div class="col-md-3">
          <select class="form-select" id="taskUser" required></select>
        </div>
        <div class="col-md-2">
          <button type="submit" class="btn btn-warning">Crear tarea</button>
        </div>
      </form>
      <ul id="taskList" class="list-group"></ul>
    </div>
  </div>
</div>

<script>
const API = "http://localhost:8080/api";

// --- Usuarios ---
async function loadUsers() {
  const res = await fetch(`${API}/users`);
  const users = await res.json();
  const userList = document.getElementById('userList');
  const taskUser = document.getElementById('taskUser');
  userList.innerHTML = '';
  taskUser.innerHTML = '<option value="">Asignar a usuario</option>';
  users.forEach(u => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>${u.username}</span>
      <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Eliminar</button>
    `;
    userList.appendChild(li);
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = u.username;
    taskUser.appendChild(opt);
  });
}
async function deleteUser(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  await fetch(`${API}/users/${id}`, { method: 'DELETE' });
  loadUsers();
  loadTasks();
}
document.getElementById('userForm').onsubmit = async e => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  if (!username) return;
  await fetch(`${API}/users`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  document.getElementById('username').value = '';
  loadUsers();
};

// --- Proyectos ---
async function loadProjects() {
  const res = await fetch(`${API}/projects`);
  const projects = await res.json();
  const projectList = document.getElementById('projectList');
  const taskProject = document.getElementById('taskProject');
  projectList.innerHTML = '';
  taskProject.innerHTML = '<option value="">Proyecto</option>';
  projects.forEach(p => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>${p.name}</span>
      <button class="btn btn-sm btn-danger" onclick="deleteProject(${p.id})">Eliminar</button>
    `;
    projectList.appendChild(li);
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    taskProject.appendChild(opt);
  });
}
async function deleteProject(id) {
  if (!confirm('¿Eliminar este proyecto?')) return;
  await fetch(`${API}/projects/${id}`, { method: 'DELETE' });
  loadProjects();
  loadTasks();
}
document.getElementById('projectForm').onsubmit = async e => {
  e.preventDefault();
  const name = document.getElementById('projectName').value.trim();
  if (!name) return;
  await fetch(`${API}/projects`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  document.getElementById('projectName').value = '';
  loadProjects();
};

// --- Tareas ---
async function loadTasks() {
  const res = await fetch(`${API}/tasks`);
  const tasks = await res.json();
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>
        ${t.title} 
        <span class='badge bg-secondary'>${t.description || ''}</span> 
        <span class='badge bg-info'>Proyecto: ${t.project_id}</span> 
        <span class='badge bg-success'>Asignado: ${t.assigned_to || '-'}</span> 
        <span class='badge bg-${t.done ? 'success' : 'warning'}'>${t.done ? 'Hecho' : 'Pendiente'}</span>
      </span>
      <button class="btn btn-sm btn-danger" onclick="deleteTask(${t.id})">Eliminar</button>
    `;
    taskList.appendChild(li);
  });
}
async function deleteTask(id) {
  if (!confirm('¿Eliminar esta tarea?')) return;
  await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
  loadTasks();
}
document.getElementById('taskForm').onsubmit = async e => {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDesc').value.trim();
  const project_id = document.getElementById('taskProject').value;
  const assigned_to = document.getElementById('taskUser').value || null;
  if (!title || !project_id) return;
  await fetch(`${API}/projects/${project_id}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, assigned_to })
  });
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value = '';
  document.getElementById('taskUser').value = '';
  loadTasks();
};

// --- Inicialización ---
window.onload = () => {
  loadUsers();
  loadProjects();
  loadTasks();
};
</script>
</body>
</html>

```

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
