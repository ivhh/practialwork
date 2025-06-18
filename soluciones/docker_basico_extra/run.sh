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
  # Mostrar los logs para depuración
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