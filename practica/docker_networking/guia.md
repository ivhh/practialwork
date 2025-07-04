# 🕸️ Guía Práctica: Docker Networks y Namespaces

Esta guía te muestra cómo funcionan las redes en Docker y cómo los contenedores usan namespaces para el aislamiento de red.

---

## 1. Crear una red personalizada

Primero, crea una red bridge personalizada llamada `red-app`:
```bash
docker network create red-app
```

## 2. Lanzar contenedores en la misma red

Crea dos contenedores (web y db) en la red `red-app`:
```bash
docker run -dit --name web --network red-app alpine sh
docker run -dit --name db --network red-app alpine sh
```

## 3. Probar la conectividad entre contenedores

Desde el contenedor `web`, haz ping al contenedor `db` usando su nombre:
```bash
docker exec -it web ping db
```
Verás que hay conectividad porque ambos están en la misma red bridge y comparten el mismo namespace de red de Docker.

## 4. Crear una segunda red y nuevos contenedores

Crea otra red y un nuevo contenedor:
```bash
docker network create red-app2
docker run -dit --name web2 --network red-app2 alpine sh
```

## 5. Namespaces y aislamiento

Intenta hacer ping desde `web2` (en `red-app2`) al contenedor `db` (en `red-app`):
```bash
docker exec -it web2 ping db
```
Verás un error: `ping: bad address 'db'`. Esto ocurre porque los contenedores en diferentes redes no pueden resolverse ni comunicarse por nombre, ya que están en distintos namespaces de red.

## 6. Errores comunes y buenas prácticas

- No puedes usar el mismo nombre de contenedor dos veces. Si intentas crear otro `web`, Docker mostrará un error de conflicto de nombre.
- El comando correcto para eliminar un contenedor es:
  ```bash
  docker rm <container_id|name>
  ```
- El flag `--network` solo se usa en `docker run`, no en `docker exec`.
- Si un contenedor no está corriendo, no puedes ejecutar comandos en él.

## 7. Resumen visual

- Contenedores en la misma red pueden comunicarse por nombre.
- Contenedores en redes distintas están aislados (diferentes namespaces de red).
- Docker networks permiten simular topologías y aislamientos de red fácilmente.

---

> Explora más sobre redes y namespaces en la [documentación oficial de Docker](https://docs.docker.com/network/).