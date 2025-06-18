# 🧪 Ejercicio 02: Aplicación Full Stack con Docker

## 🎯 Objetivo

Crear una aplicación full stack (frontend + backend) utilizando Docker para contenerizar ambos servicios y permitir que se comuniquen entre sí.

## 🚀 Pasos

### Backend

1. En la carpeta `backend`, crea un archivo `server.js` con un servidor Express:

```javascript
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
```

2. Crea un archivo `package.json` para el backend:

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js"
  },
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
```

3. Crea un `Dockerfile` para el backend:

```dockerfile
# Usa una imagen base de Node.js más estable
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia primero solo package.json y package-lock.json para aprovechar la caché de Docker
COPY package*.json ./

# Instalar primero express y cors para asegurar que están disponibles antes de otras dependencias
RUN npm install express cors && \
    npm install && \
    npm list express cors

# Copia el resto de los archivos de la aplicación
COPY . .

# Configuración del entorno para asegurar que la aplicación escuche en todos los interfaces
ENV NODE_ENV=production
ENV PORT=3010
ENV HOST=0.0.0.0

# Expone el puerto 3010 para acceder a la aplicación
EXPOSE 3010

# Crea el directorio public para evitar errores con express.static
RUN mkdir -p public

# Comando por defecto para iniciar el servidor
CMD ["node", "server.js"]
```

### Frontend

1. En la carpeta `frontend`, crea un archivo `index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><title>App con Backend</title></head>
<body>
  <h1>Hola Mundo con Backend</h1>
  <button id="btn">Pedir saludo</button>
  <p id="saludo"></p>

  <script>
    document.getElementById('btn').onclick = () => {
      fetch('http://localhost:3010/api/saludo')
        .then(res => res.json())
        .then(data => {
          document.getElementById('saludo').textContent = data.mensaje;
        });
    };
  </script>
</body>
</html>
```

2. Crea un `Dockerfile` para el frontend:

```dockerfile
# Usar la imagen oficial de Nginx
FROM nginx:latest   
# Copiar el archivo index.html al directorio de Nginx
COPY index.html /usr/share/nginx/html/index.html
# Exponer el puerto 80
EXPOSE 80
```

### Scripts para gestionar los contenedores

1. Crea un archivo `run.sh` para construir y ejecutar ambos contenedores:

```bash
# Construir y ejecutar el contenedor del backend
BACKEND_IMAGE=mi-backend
BACKEND_DIR=./backend
BACKEND_CONTAINER_NAME=backend-container

# Asegurarse de que cualquier contenedor previo se detenga y elimine por nombre
echo "Limpiando contenedores previos..."
docker rm -f $BACKEND_CONTAINER_NAME 2>/dev/null || true
# También eliminar por imagen en caso de que existan otros contenedores con la misma imagen
docker rm -f $(docker ps -q --filter ancestor=$BACKEND_IMAGE) 2>/dev/null || true

echo "Construyendo imagen del backend..."
# Construir con --no-cache para evitar problemas de caché
docker build --no-cache -t $BACKEND_IMAGE -f $BACKEND_DIR/Dockerfile $BACKEND_DIR

echo "Iniciando contenedor del backend..."
BACKEND_CONTAINER_ID=$(docker run -d -p 3010:3010 --name $BACKEND_CONTAINER_NAME $BACKEND_IMAGE)

# Verificar si el contenedor se inició correctamente
if [ -z "$BACKEND_CONTAINER_ID" ]; then
  echo "Error: No se pudo iniciar el contenedor del backend"
  echo "Revisando logs para depuración:"
  docker logs $BACKEND_CONTAINER_NAME 2>&1 || echo "No se encontró el contenedor $BACKEND_CONTAINER_NAME"
  exit 1
else
  echo "Backend iniciado correctamente"
  echo "Esperando 3 segundos para que el servicio se inicialice..."
  sleep 3
  echo "Mostrando logs:"
  docker logs $BACKEND_CONTAINER_ID
fi

# Construir y ejecutar el contenedor del frontend
FRONTEND_IMAGE=mi-frontend
FRONTEND_DIR=./frontend
FRONTEND_CONTAINER_NAME=frontend-container

# Asegurarse de que cualquier contenedor previo se detenga y elimine
echo "Limpiando contenedores previos del frontend..."
docker rm -f $FRONTEND_CONTAINER_NAME 2>/dev/null || true
docker rm -f $(docker ps -q --filter ancestor=$FRONTEND_IMAGE) 2>/dev/null || true

echo "Construyendo imagen del frontend..."
# Construir el frontend
docker build -t $FRONTEND_IMAGE -f $FRONTEND_DIR/Dockerfile $FRONTEND_DIR

echo "Iniciando contenedor del frontend..."
FRONTEND_CONTAINER_ID=$(docker run -d -p 8080:80 --name $FRONTEND_CONTAINER_NAME $FRONTEND_IMAGE)

# Verificar si el contenedor se inició correctamente
if [ -z "$FRONTEND_CONTAINER_ID" ]; then
  echo "Error: No se pudo iniciar el contenedor del frontend"
  exit 1
else
  echo "Frontend iniciado correctamente"
fi

# Mostrar los IDs de los contenedores
echo "Backend container ID: $BACKEND_CONTAINER_ID"
echo "Frontend container ID: $FRONTEND_CONTAINER_ID"

# Verificar que los contenedores estén funcionando
echo "Estado de los contenedores:"
docker ps | grep -E "$BACKEND_CONTAINER_NAME|$FRONTEND_CONTAINER_NAME"
```

2. Crea un archivo `stop.sh` para detener y eliminar los contenedores:

```bash
# Detener y eliminar el contenedor del backend
BACKEND_IMAGE=mi-backend
BACKEND_CONTAINERS=$(docker ps -q --filter ancestor=$BACKEND_IMAGE)

if [ -n "$BACKEND_CONTAINERS" ]; then
  echo "Stopping backend containers..."
  docker stop $BACKEND_CONTAINERS
  docker rm $BACKEND_CONTAINERS
  echo "Backend containers stopped and removed."
else
  echo "No running backend containers found."
fi

# Detener y eliminar el contenedor del frontend
FRONTEND_IMAGE=mi-frontend
FRONTEND_CONTAINERS=$(docker ps -q --filter ancestor=$FRONTEND_IMAGE)

if [ -n "$FRONTEND_CONTAINERS" ]; then
  echo "Stopping frontend containers..."
  docker stop $FRONTEND_CONTAINERS
  docker rm $FRONTEND_CONTAINERS
  echo "Frontend containers stopped and removed."
else
  echo "No running frontend containers found."
fi
```

## 🔍 Verificación

1. Ejecuta el script `run.sh` para construir y iniciar los contenedores:

```bash
bash run.sh
```

2. Abre un navegador y accede a `http://localhost:8080`.

3. Haz clic en el botón "Pedir saludo". Deberías ver el mensaje "Hola desde el backend!".

4. Para detener los contenedores, ejecuta:

```bash
bash stop.sh
```

## 🧠 Conceptos clave

- **Contenerización**: Empaquetado de aplicaciones y sus dependencias para garantizar su funcionamiento en cualquier entorno.
- **Frontend**: Interfaz visible para el usuario.
- **Backend**: Servidor que procesa las solicitudes y maneja la lógica de negocio.
- **API REST**: Interfaz que permite la comunicación entre el frontend y el backend.
- **CORS**: Mecanismo que permite que los recursos de una página web sean solicitados desde otro dominio.