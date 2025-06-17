# 🧪 Ejercicio 01: HTML Básico + Docker

## 🎯 Objetivo

Crear un sitio web simple con un mensaje en pantalla y levantarlo con Docker y Nginx.

## 🚀 Pasos

1. Instalar Docker en tu máquina.

2. En la carpeta `practica/docker_basico`, crear un archivo llamado `index.html` con el siguiente contenido:

```html
<h1>¡Hola mundo desde Docker!</h1>
<p>Funcionó!!!!</p>
```

3. Crear un archivo `Dockerfile` en la misma carpeta con el siguiente contenido:

```dockerfile
# Usar la imagen oficial de Nginx
FROM nginx:latest   
# Copiar el archivo index.html al directorio de Nginx
COPY index.html /usr/share/nginx/html/index.html
# Exponer el puerto 80
EXPOSE 80
```

4. Construir la imagen de Docker con el siguiente comando:

```bash
docker build -t mi-imagen-nginx .
```

5. Ejecutar un contenedor a partir de la imagen creada con el siguiente comando:

```bash
docker run -d -p 8080:80 mi-imagen-nginx
```

6. Abrir un navegador y acceder a `http://localhost:8080`. Deberías ver el mensaje "¡Hola mundo desde Docker!" y "Funcionó!!!!".


