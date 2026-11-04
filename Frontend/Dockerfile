FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY . .
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# Note: This is the IndiAR frontend served via NGINX
# SPA configured with history mode (no # in URLs)
# The backend API (Flask) runs separately via docker-compose
# CRUD modules are client-side HTML/JS with Vue.js