const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3010;

// Habilitar CORS para todas las solicitudes
app.use(cors({
  origin: '*', // Permite cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Sirve archivos estáticos (index.html, etc.)
app.use(express.static('public'));

// Middleware para procesar JSON
app.use(express.json());

// Endpoint para consulta simple
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: 'Hola desde el backend!' });
});

// Añadir un endpoint para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando correctamente');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
  console.log('CORS habilitado para todos los orígenes');
});