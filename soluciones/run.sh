docker build -t mi-imagen-nginx .
docker run -d -p 8080:80 mi-imagen-nginx