# 🛠️ Guía rápida: Cómo revertir cambios en Git

## 📍Objetivo
Aprender a deshacer cambios en distintas etapas del flujo local: antes de agregar (`add`), después de agregar, y después de commitear.

---

## 1. Deshacer cambios en un archivo sin agregarlo

```bash
echo "cambio no deseado" >> saludo.txt
git restore saludo.txt
```
🔁 Esto revierte el archivo a su última versión guardada (último commit).

2. Deshacer cambios después de usar git add

```bash
git add saludo.txt
git restore --staged saludo.txt
```
🔁 Esto saca el archivo del área de staging. Aún conserva los cambios en el working directory.

3. Revertir un commit reciente (pero mantener los cambios)
```bash
git reset --soft HEAD~1
```
🔁 Esto borra el commit más reciente, pero mantiene tus cambios listos para re-commitear.

4. Revertir un commit y eliminar también los cambios
```bash
git reset --hard HEAD~1
```
⚠️ ¡Cuidado! Esto borra el commit y los archivos modificados.

5. Corregir el mensaje de un commit reciente
```bash
git commit --amend -m "Mensaje corregido"
```
🔁 Ideal si te equivocaste en el mensaje o te faltó agregar algo.

✅ Cuadro resumen

| Situación                                   | Comando recomendado                     |
|---------------------------------------------|-----------------------------------------|
| Deshacer cambios sin agregar                 | `git restore archivo.txt`               |
| Deshacer cambios después de `add`           | `git restore --staged archivo.txt` |
| Corregir último commit (mensaje o más)      | `git commit --amend`               |
| Quitar el último commit (conservar cambios) | `git reset --soft HEAD~1`          |
| Borrar commit y cambios                      | `git reset --hard HEAD~1`          |   

🔒 Consejo: Evita reset --hard si ya compartiste el commit o si no hiciste backup.
