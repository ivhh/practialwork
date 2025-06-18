docker
# Stop and remove the running container based on the image
CONTAINER_ID=$(docker ps -q --filter ancestor=mi-imagen-nginx)
if [ -n "$CONTAINER_ID" ]; then
  docker stop $CONTAINER_ID
  docker rm $CONTAINER_ID
else
  echo "No running container found for image mi-imagen-nginx."
fi