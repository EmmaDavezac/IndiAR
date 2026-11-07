# Etapa 1: Build con Node.js
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./
COPY vite.config.js ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar archivos compilados desde la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Note: This is the IndiAR frontend served via NGINX
# SPA configured with history mode (no # in URLs)
# The backend API (Flask) runs separately via docker-compose
# CRUD modules are client-side HTML/JS with Vue.js