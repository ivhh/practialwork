import pkg from 'pg';
import express from 'express';
import axios from 'axios'; // Importar axios como un objeto común

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

app.patch('/api/tasks/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;

  try {
    // 1. Llamar al microservicio de validación con content type application/json

    const validationResponse = await axios.post('http://availability_validator:5001/validate', { userId: assigned_to }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!validationResponse.data.available) {
      console.log(`Usuario ${assigned_to} no disponible: ${validationResponse.data.reason}`);
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

// Eliminar tarea
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.status(204).end();
});

app.listen(5000, () => {
  console.log('Backend listening on port 5000');
});
