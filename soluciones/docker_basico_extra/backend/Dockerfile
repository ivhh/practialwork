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