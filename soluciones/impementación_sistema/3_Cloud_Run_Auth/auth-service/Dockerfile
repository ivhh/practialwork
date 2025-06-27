FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY src ./src

# 2. Imagen final
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app /app
ENV PORT=8080
ENV JWT_SECRET="supersecreto"
CMD ["node", "src/index.js"]