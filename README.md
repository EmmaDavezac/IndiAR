# IndiAR - Tienda de Juegos Indie
- **Vue.js**: Incluido vía CDN en `index.html`

## Descripción General
**IndiAR** es una tienda en línea interactiva para juegos indie, construida con HTML5, CSS3 y JavaScript puro. La aplicación presenta una interfaz moderna y responsiva con un slider interactivo, categorías de juegos, y funcionalidades de búsqueda y filtrado.

## 📁 Estructura del Proyecto

```bash
.
├── .env              # Variables de entorno (no subir a git - incluido en .gitignore)
├── .env.example      # Ejemplo de variables de entorno
├── .gitignore        # Configuración de gitignore (ignora .env)
├── api/              # Backend Flask API
├── docker-compose.yml # Orquesta: nginx + Flask + MySQL
├── Dockerfile        # Documentación del proyecto
├── indiAR-front/     # Frontend Vue.js + HTML/CSS/JS
│   ├── Dockerfile    # Configuración del frontend
│   └── ...
├── api/              # Backend Flask API
│   ├── API.py        # Flask con todas las endpoints CRUD
│   └── *.html        # Módulos CRUD
├── fonts/            # Fuentes locales
├── assets/           # CSS, JS, imágenes
└── README.md         # Esta documentación
```
## 🐳 Docker

### Prerrequisitos
- Docker y Docker Compose instalados

### Instalación Local (con Docker)
```bash
# Clonar el repositorio
git clone <repository-url>
cd IndiAR

# Levantar el stack (frontend + backend + mysql)
docker-compose up -d
```

### Puertos del Servicio
- **Frontend (NGINX)**: `http://localhost:8080`
- **Backend API (Flask)**: `http://localhost:5000/api/...`
- **MySQL**: `localhost:3306`

### Preparación para Google OAuth
El inicio de sesión con Google todavía no está implementado. Para dejar preparada
la configuración futura, crea un cliente OAuth de tipo aplicación web en Google
Cloud, agrega `http://localhost:8080` como origen autorizado y guarda su ID público
en `GOOGLE_CLIENT_ID` dentro de `.env` (la variable también está en `.env.example`).
No agregues un Client Secret al frontend. Definir esta variable por sí sola no
habilita el acceso con Google.

---

## 🛠️ Ejecución Local (sin Docker)

### Prerrequisitos
- Node.js y npm instalados
- Python 3.9+ instalado
- MySQL server o cliente (como MySQL Workbench) instalado y corriendo

### 1. Configurar Variables de Entorno
```bash
cd IndiAR
cp .env .env.local  # Copiar y modificar según sea necesario
```
Edita el archivo `.env.local` con tus configuraciones locales:
- `MYSQL_HOST=localhost` (o `127.0.0.1`)
- `MYSQL_PORT=3306`
- `MYSQL_USER=user`
- `MYSQL_PASSWORD=password`
- `MYSQL_DB=indiar`
- `FLASK_ENV=development`
- `FLASK_DEBUG=1`
- `HOST=0.0.0.0`

### 2. Iniciar la Base de Datos MySQL
Asegúrate de que MySQL esté corriendo en `localhost:3306`. Puedes crear la base de datos manualmente:
```sql
CREATE DATABASE indiar;
```

### 3. Iniciar el Backend API (Flask)
```bash
cd API
python API.py
```
El backend estará disponible en `http://localhost:5000/api/...`

### 4. Iniciar el Frontend (Vue.js)
```bash
cd indiAR-front
npm install        # Instalar dependencias (solo la primera vez)
npm run dev        # Servir en http://localhost:8080
```

### 5. Acceder a la Aplicación
- **Frontend**: `http://localhost:8080`
- **API Documentation (Swagger)**: `http://localhost:5000/swagger`
- **pgadmin (visual DB)**: `http://localhost:8081`

### Nota Importante
- El archivo `.env` no se sube a git (está en `.gitignore`)
- Para producción, siempre utiliza credenciales seguras y cambia las variables en el `.env`
- Cada commit que afecte UI, lógica o service worker debe incrementar el `CACHE_VERSION` en `src/sw.js`

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilizado con arquitectura modular
- **JavaScript Puro** - Interactividad y lógica del lado del cliente
- **FontAwesome Local** - Íconos (reemplazo de CDN externo)
- **Vue.js via CDN** - Framework frontend vía CDN (https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js)
- **NGINX Alpine** - Servidor web para producción Docker
- **MySQL** - Base de datos integrada para funcionalidad backend (login/registro)
- **Flask** - API backend con endpoints CRUD
- **CSS Puro** - Sin frameworks CSS (estilos custom)

## 📦 Dependencias Locales

La aplicación incluye todas las dependencias necesarias localmente:

- **FontAwesome**: `assets/css/fontawesome.min.css` - íconos incluidos
- **Fuentes**: `fonts/` - Poppins y Roboto
- **Sin dependencias externas**: La aplicación no requiere CDNs para funcionar

## 🚀 Scripts y Funcionalidades

### JavaScript Principal
- `script-home-page.js`: Controla el slider, filtros de juegos, y interacciones del carrito
- `script-game-page.js`: Detalle de juegos individuales
- `menu-scripts.js`: Menú móvil, apertura/cerre de navegación
- `validation-scripts.js`: Validación de formularios de login/contacto
- `Imagen-scripts.js`: Manejo y preview de imágenes

### Partials (Fragmentos HTML)
- `contacto.html` - Formulario de contacto
- `login.html` - Formulario de inicio de sesión
- `Error.html` - Página de error personalizada

## 📦 Módulos CRUD

IndiAR incluye módulos CRUD completos para gestión de datos:

| Módulo | Descripción |
|--------|-------------|
| **Usuario** | Gestión de perfiles y credenciales |
| **Juego** | Catálogo y administración de juegos |
| **Requisito** | Sistema de requisitos por juego |
| **Imagen** | Gestión de assets e imágenes |

## 🎯 Features Destacados

- ✅ Interfaz responsiva (mobile-first)
- ✅ Slider interactivo con juegos destacados
- ✅ Filtrado y búsqueda de juegos
- ✅ Carrito de compras interactivo
- ✅ Formularios de contacto y login
- ✅ Modos CRUD para gestión de contenido
- ✅ FontAwesome 100% local (sin dependencias externas)
- ✅ Optimizado para Docker
- ✅ Sin dependencias de node_modules ni build steps complejos

## 🚀 Ejecución Local en Modo Desarrollo

Esta sección explica cómo ejecutar la API y el Frontend en modo desarrollo/debug de forma local sin usar Docker.

### � API Flask (Backend)

#### Prerrequisitos
- Python 3.9+ instalado
- `pip` disponible

#### Instalación y Ejecución

1. **Clonar el repositorio** (si aún no está hecho):
   ```bash
   git clone <repository-url>
   cd IndiAR
   ```

2. **Crear y activar un entorno virtual** (recomendado):
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows:
   set FLASK_ENV=development
   set FLASK_DEBUG=1
   flask run --port=5000
   ```

3. **Instalar dependencias de la API**:
   ```bash
   pip install -r API/requirements.txt
   ```

4. **Configurar variables de entorno**:
   Copia el archivo de ejemplo y ajusta los valores según sea necesario:
   ```bash
   cp .env.example .env
   ```
   El archivo `.env` ya incluye las configuraciones por defecto para MySQL y Flask:
   - `FLASK_ENV=development` - Modo desarrollo de Flask
   - `FLASK_DEBUG=1` - Modo debug activado
   - `FLASK_PORT=5000` - Puerto de la API
   - Variables de MySQL para conexión a base de datos

5. **Ejecutar la API en modo desarrollo**:
   ```bash
   cd API
   python API.py
   ```
   La API estará disponible en `http://localhost:5000`

   *Alternativamente, usando Flask CLI:*
   ```bash
   export FLASK_ENV=development  # En Windows: set FLASK_ENV=development
   export FLASK_DEBUG=1          # En Windows: set FLASK_DEBUG=1
   flask run --port=5000
   ```

#### Endpoints Principales
- `GET /api/juegos` - Listar juegos
- `GET /api/juegos/<id>` - Obtener juego por ID
- `POST /api/juegos` - Crear nuevo juego (requiere admin)
- `PUT /api/juegos/<id>` - Actualizar juego (requiere admin)
- `DELETE /api/juegos/<id>` - Eliminar juego (requiere admin)
- `POST /api/registrar` - Registrar nuevo usuario

---

### 🌐 Frontend (Vue.js + HTML/CSS/JS)

#### Prerrequisitos
- Node.js instalado (versión 14 o superior recomendada)
- `npm` o `yarn` disponible

#### Instalación y Ejecución

1. **Acceder al directorio del Frontend**:
   ```bash
   cd Frontend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```
   *O con yarn: `yarn install`*

3. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   El frontend estará disponible en `http://localhost:8080`

   *El script `dev` usa `http-server . -p 8080 -c-1` para servir los archivos estáticos con recarga automática.*

#### Características del modo desarrollo
- Los cambios en los archivos HTML/CSS/JS se reflejan instantáneamente
- Los source de Vue.js se compilan en tiempo real
- Conexión automática a la API en `http://localhost:5000/api/...`
- Vue Devtools disponibles en el navegador

---

### 🔗 Ejecución Combinada (API + Frontend)

Para ejecutar ambos servicios simultáneamente en modo desarrollo:

1. **Terminar 1** - Iniciar la API en una terminal:
   ```bash
   # Desde el directorio raíz
   source venv/bin/activate  # Si usas venv
   python API/API.py
   ```

2. **Terminar 2** - Iniciar el frontend en otra terminal:
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Acceder a la aplicación**:
   - Frontend: `http://localhost:8080`
   - API: `http://localhost:5000/api/...`

---

### 🐳 Con Docker (Alternativa)

Si prefieres usar Docker (el método original):

```bash
docker-compose up -d
```

- **Frontend (NGINX)**: `http://localhost:8080`
- **Backend API (Flask)**: `http://localhost:5000/api/...`
- **MySQL**: `localhost:3306`

Para detener:
```bash
docker-compose down

## 📝 Notas de Migración

- Se migró de FontAwesome CDN a versión local en `assets/css/fontawesome.min.css`
- Rutas de assets actualizadas de `./Scripts/` a `./assets/js/` y `./Estilos/` a `./assets/css/`
- Se añadió directorio `partials/` para fragmentos HTML reutilizables
- Estructura reorganizada para mejor mantenibilidad

## 🔑 Variables de Entorno

El proyecto utiliza un archivo `.env` para configuración. Copia `.env.example` a `.env` y modifica los valores:

```bash
cp .env.example .env
```

**Variables disponibles:**

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `MYSQL_HOST` | `db` | Host de MySQL |
| `MYSQL_PORT` | `3306` | Puerto de MySQL |
| `MYSQL_USER` | `user` | Usuario de MySQL |
| `MYSQL_PASSWORD` | `password` | Contraseña de MySQL |
| `MYSQL_DB` | `indiar` | Nombre de la base de datos |
| `FLASK_ENV` | `development` | Entorno de Flask |
| `FLASK_DEBUG` | `1` | Modo debug de Flask |
| `FLASK_PORT` | `5000` | Puerto de la API Flask |
| `HOST` | `0.0.0.0` | Host del servidor |

⚠️ **Importante**: El archivo `.env` no se sube a git (está en `.gitignore`).

## 📄 Licenciamiento



## 🐳 Acceso Visual a la Base de Datos (pgweb)

La base de datos MySQL también es accesible través de pgweb, un cliente web visual para bases de datos:

- **pgweb**: `http://localhost:8081`
- **MySQL Host**: `db` (servicio Docker)
- **Puerto**: `3306`
- **Usuario**: `user`
- **Contraseña**: `password`
- **Base de datos**: `indiar`

Esto permite visualizar y consultar la base de datos mediante un navegador web sin necesidad de herramientas de línea de comandos.

© 2023 IndiAR. Todos los derechos reservados.

## 👥 Desarrolladores

- **Emmanuel Davezac** - Fullstack Developer (proyecto personal)
- Plataforma para juegos independientes argentinos - desarrollo full stack Python realizado de forma individual

> **Nota**: IndiAR es un proyecto de desarrollo personal de Emmanuel Davezac, no pertenece a ningún grupo de investigación. Es una plataforma completa (front-end + back-end + base de datos) construida con Python/Flask, Vue.js, MySQL y Docker, diseñada para apoyar la distribución de juegos indie argentinos.
## 🛠️ Inicialización de Base de Datos

Al iniciar la API por primera vez, se ejecutará automáticamente la función `init_db()` que:

1. **Creará la tabla `Usuarios`** si no existe con las columnas:
   - `ID` (auto-incremental, primary key)
   - `Nombre` (VARCHAR 100, obligatorio)
   - `Email` (VARCHAR 100, único, obligatorio)
   - `Password` (VARCHAR 255, obligatorio - almacenado en hash)
   - `es_Admin` (BOOLEAN, default FALSE)

2. **Creará el usuario administrador por defecto**:
   - **Email**: `admin@indiAR.com`
   - **Password**: `admin123` (almacenado de forma segura con PBKDF2)
   - **Rol**: Administrador (`es_Admin = 1`)

### Ejecución Automática

La inicialización ocurre automaticamente al iniciar el servidor Flask:
```bash
cd API
python API.py
```

### Variables de Entorno

Puedes personalizar la inicialización modificando estos valores en el archivo `.env`:

```bash
ADMIN_EMAIL=admin@miapp.com
ADMIN_PASSWORD=miPasswordSeguro
```

El hash de la contraseña se generará automáticamente usando PBKDF2 con 100,000 iteraciones.

## 🔑 Credenciales de Prueba

Para fines de prueba y desarrollo, las siguientes credenciales están disponibles:

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| **Admin** | `admin@indiar.com` | `admin1234` | Administrador |
| **Usuario de prueba** | `test@test.com` | `test1234` | Usuario registrado |

> **Importante**: Estas credenciales son solo para testing y desarrollo local. El usuario administrador se crea automáticamente al iniciar la API por primera vez (ver sección "Inicialización de Base de Datos"). Para producción, siempre utiliza credenciales seguras y cambia las variables en el archivo `.env`.
## Documentation Swagger

The API includes automatic documentation using Swagger (OpenAPI):

- **Swagger UI**: `http://localhost:5000/swagger`
- **Swagger JSON**: `http://localhost:5000/swagger.json`

The documentation includes:
- All endpoints with detailed descriptions
- Request and response models
- Bearer token authentication parameters
- HTTP status codes
- Request and response examples

Each commit that affects UI, logic or service worker must increment the `CACHE_VERSION` in `src/sw.js` to force update in installed clients.
