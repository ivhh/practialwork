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