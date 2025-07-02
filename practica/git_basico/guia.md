# 🛠️ Guía de Uso Básico de Git

Esta guía te ayudará a comenzar a usar Git en un proyecto local. Aprenderás a inicializar un repositorio, registrar cambios, y mantener un historial.

---

## 📁 1. Crear un proyecto y archivo

```bash
mkdir mi-proyecto-git
cd mi-proyecto-git
echo "Hola mundo" > saludo.txt
```

## 🌱 2. Iniciar un repositorio Git

```bash
git init
```

Esto crea un repositorio local en la carpeta .git

## 🔍 3. Ver el estado del proyecto

```bash
git status
```

Esto muestra los archivos modificados, no rastreados y el estado del repositorio.

## ➕ 4. Agregar archivos al área de staging

```bash
git add saludo.txt
```

Esto prepara el archivo para ser confirmado (commit).

o bien agregar todos los archivos:

```bash
git add .
```

## ✔️ 5. Confirmar cambios (commit)

```bash
git commit -m "Agregar saludo inicial"
```

Esto guarda los cambios en el historial del repositorio con un mensaje descriptivo.

## 📜 6. Ver el historial de commits

```bash
git log
```

Esto muestra un registro de todos los commits realizados, con sus mensajes y hashes únicos.

o bien con visualización en árbol:

```bash
git log --oneline --graph --all
```

## 📝 7. Editar un archivo y registrar nuevos cambios

```bash
echo "¡Hola, Git!" >> saludo.txt
git add saludo.txt
git commit -m "Actualizar saludo"
```

## ⛔ 8. Recuperar archivos antes de agregarlos

```bash
git restore saludo.txt
```

## 🕒 9. Ver diferencias entre versiones

Antes de agregar cambios:

```bash
git diff
```

Después de agregarlos (pero antes de commitear):

```bash
git diff --cached
```

## 🚀 10. Conectar con un repositorio remoto (opcional)

```bash
git remote add origin https://github.com/usuario/mi-repo.git
git branch -M main
git push -u origin main
```

## Comandos usados (table)

| Comando                        | Descripción                                      |
|--------------------------------|--------------------------------------------------|
| `git init`                     | Inicializa un nuevo repositorio Git.             |
| `git status`                   | Muestra el estado del repositorio.               |
| `git add <archivo>`            | Agrega un archivo al área de staging.         |
| `git add .`                    | Agrega todos los archivos al área de staging.         |
| `git commit -m "<mensaje>"`    | Confirma los cambios con un mensaje.         |
| `git log`                      | Muestra el historial de commits.                 |
| `git log --oneline --graph --all` | Muestra el historial en formato compacto y gráfico. |
| `git restore <archivo>`        | Recupera un archivo a su estado anterior.         |
| `git diff`                     | Muestra las diferencias no agregadas.         |
| `git diff --cached`            | Muestra las diferencias agregadas pero no confirmadas. |
| `git remote add origin <url>`  | Conecta el repositorio local a un remoto.       |
| `git branch -M main`           | Renombra la rama actual a `main`.         |
| `git push -u origin main`      | Envía los cambios al repositorio remoto. |