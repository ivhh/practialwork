# 📦 Guía Práctica: Docker Volumes y Montaje de Carpetas

Esta guía te muestra cómo funcionan los volúmenes y los bind mounts en Docker, y cómo evitar errores comunes relacionados con carpetas que no existen.

---

## 1. Crear un volumen y usarlo en un contenedor

Crea un volumen llamado `datos-app` y móntalo en `/app`:

```bash
docker volume create datos-app
docker run -dit --name app1 -v datos-app:/app alpine sh
```

Crea un archivo dentro del volumen desde el contenedor:

```bash
docker exec app1 sh -c "echo 'Hola desde Docker' > /app/mensaje.txt"
```

---

## 2. Montar una carpeta local en un contenedor (bind mount)

**¡Importante!** Antes de montar una carpeta local, asegúrate de que exista en tu sistema:

```bash
mkdir -p /home/contacto/proyecto
```

Luego, monta la carpeta en el contenedor:

```bash
docker run -dit --name app2 -v /home/contacto/proyecto:/usr/share/proyecto alpine sh
```

---

## 3. Errores comunes y cómo evitarlos

- Si intentas montar una carpeta local que no existe, Docker la creará vacía, pero puede que no tenga el contenido esperado.
- Si usas el mismo nombre de contenedor (`--name app2`) y ya existe, verás un error de conflicto. Elimina el contenedor anterior antes de crear uno nuevo:

  ```bash
  docker rm -f app2
  ```

- Para ver los volúmenes existentes:

  ```bash
  docker volume ls
  ```

- El comando correcto para eliminar un contenedor es:

  ```bash
  docker rm <container_id|name>
  ```

- El comando correcto para listar contenedores es:

  ```bash
  docker ps
  ```

---

## 4. Verificar el contenido del volumen o carpeta montada

Entra al contenedor y revisa el contenido:

```bash
docker exec -it app1 sh
ls /app
cat /app/mensaje.txt
```

Para bind mounts:

```bash
docker exec -it app2 sh
ls /usr/share/proyecto
```

---

## 5. Resumen visual

- Los volúmenes Docker (`docker volume create`) son gestionados por Docker y persisten datos aunque elimines el contenedor.
- Los bind mounts (`-v /ruta/local:/ruta/contenedor`) permiten compartir carpetas locales con el contenedor, pero la carpeta local debe existir antes de montar.

---

> Consulta la [documentación oficial de Docker sobre volúmenes](https://docs.docker.com/storage/volumes/) para más detalles y buenas prácticas.