-- Tabla de usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de proyectos
CREATE TABLE project (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Tabla de tareas
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  done BOOLEAN DEFAULT FALSE
);
