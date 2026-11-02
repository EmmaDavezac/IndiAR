# Guía para Agentes de IA (AGENTS.md)

Este documento define las reglas de comportamiento, directivas de Git y convenciones que **cualquier agente de IA** (Antigravity, Cursor, Claude Code, Copilot, Windsurf, etc.) debe seguir estrictamente al interactuar con el repositorio **IndiAR**. Este es la fuente de autoridad operativa.

---
## 1. Política de Git y Estrategia de Ramas (MANDATORIO)

> ⚠️ **REGLA ESTRICTA**: NUNCA realices commits directos sobre las ramas `master`, `main` ni `dev`.

### Flujo de trabajo para cada nueva funcionalidad o corrección:
Cada vez que el usuario solicite implementar, modificar o corregir algo:

1. **Verificar el estado del repositorio:**
   ```bash
   git status
   ```
   Asegúrate de que no haya cambios sin confirmar. Si hay cambios previos, consulta con el usuario o haz un stash antes de continuar.

2. **Posicionarse en `dev` y actualizar:**
   ```bash
   git checkout dev
   git pull origin dev
   ```
   *(Si la rama `dev` no existe localmente pero está en remoto: `git checkout -b dev origin/dev`).*

3. **Crear y activar la nueva rama a partir de `dev`:**
   Usa nombres descriptivos en minúsculas separados por guiones:
   - Nuevas funcionalidades: `feat/<nombre-descriptivo>`
   - Correcciones de errores: `fix/<nombre-descriptivo>`
   - Tareas o refactorizaciones: `chore/<nombre-descriptivo>`

   ```bash
   git checkout -b feat/<nombre-descriptivo>
   ```

4. **Verificar la rama activa:**
   Confirma que estás en la rama creada antes de editar cualquier archivo:
   ```bash
   git branch --show-current
   ```

5. **Commits y Mensajes:**
   - Realiza los cambios únicamente dentro de la rama creada.
   ---
## 6. Convenciones de PWA y Versionado de Service Worker

### Versionado obligatorio en cada commit que afecte UI, lógica o service worker

Cada commit que cambie UI, lógica, estilos o el service worker **DEBE** subir la versión del service worker para forzar la actualización en los clientes instalados.

1. **Subir `CACHE_VERSION` en `src/sw.js`** (o el archivo correspondiente):
   ```js
   const CACHE_VERSION = 'vNÚMERO'; // +1 en cada commit con cambios de app
   ```
   - El nombre del caché runtime (`runtime-<versión>`) cambia, el `activate` borra el runtime viejo y `skipWaiting()` + `clients.claim()` toman el control de inmediato.
   - El SW avisa a las páginas con `{ type: 'APP_VERSION', version }`.

2. **No tocar** `updateViaCache: 'none'` en `src/react-main.jsx` ni el `globIgnores: ['**/*.html']` en `vite.config.js`: así el navegador chequea `/sw.js` contra la red en cada visita y el HTML nunca queda precacheado.

3. **Animación de actualización (obligatoria, no salto abrupto):**
   - Al recibir `APP_VERSION` (o `controllerchange` como respaldo), la app muestra `AppUpdateOverlay` ("Actualizando a la nueva versión…" con el corazón de la marca latiendo, reutilizando `.loader-overlay` y `.heart-spinner`) durante ~1.2s (`APP_UPDATE_OVERLAY_MS` en `src/appUpdate.js`) y recién ahí recarga.
   - Lógica en `src/appUpdate.js` (`initAppVersionWatcher`), overlay en `src/components/AppUpdateOverlay.jsx`, montado en `src/react-main.jsx`.
   - Sin emojis (guía visual). Sin botones ni confirmaciones: la actualización es automática y silenciosa salvo el overlay.

4. **Verificar** con `npm run build` antes de commitear.

---
## 7. Convenciones de Commit

- Prefijos: `fix(...)`, `feat(...)`, `chore(...)`, `docs(...)`.
- Si el commit incluye bump de versión del SW, mencionarlo en el mensaje (ej. `fix(pwa): ... (SW v22 → v23)`).
- No commitear `dist/` (está en `.gitignore`): el deploy lo reconstruye.
- **Regla adicional de SGEN**: Si el cambio afecta el service worker o la versión cacheada, incluir `(SW vX → vY)` en el mensaje convencional.
- **Stack tecnológico**: MySQL como base de datos, SQLAlchemy como ORM, Vue 3 como frontend, Bootstrap 5 para estilos, Flask como backend.

## 8. Reglas de Estilo y UI

- **Sin emojis** en commits, mensajes de UI, changelog ni código: la guía visual (`GUIA_VISUAL.md`) lo prohíbe. Usar texto plano en su lugar.
- **Seguir el `GUIA_VISUAL.md`** para todas las decisiones de interfaz y experiencia de usuario. Este documento es la autoridad suprema sobre colores, tipografía, espaciado, componentes y interacciones.
- **Principios de diseño visual**:
  - **Paleta de colores**: Definida en `GUIA_VISUAL.md` - usar variables CSS `--color-primary`, `--color-secondary`, `--color-success`, `--color-error`, `--color-warning` en lugar de valores hardcodeados.
  - **Tipografía**: Tamaños y familias de fuente definidas en `GUIA_VISUAL.md` - usar `font-family: var(--font-base)` y tamaños escalados (`--font-size-xs`, `--font-size-sm`, `--font-size-md`, `--font-size-lg`).
  - **Espaciado**: Sistema de 4 puntos (`--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`) consistente en todos los componentes.
  - **Radio de bordes**: Valores consistentes `--border-radius-sm`, `--border-radius-md`, `--border-radius-lg`.
  - **Sombras**: `--shadow-sm`, `--shadow-md`, `--shadow-lg` para profundidad visual consistente.
- **Componentes de Bootstrap 5**:
  - Utilizar clases utility (`d-flex`, `justify-content-between`, `align-items-center`, `mt-3`, `mb-4`, etc.) en lugar de CSS custom cuando sea posible.
  - Los componentes de Bootstrap (`btn`, `form-control`, `modal`, `navbar`, `card`) deben usarse "out of the box" con sus clases default; personalizaciones deben hacerse mediante sobreescritura de variables CSS en `src/variables.css` y no !important.
  - **Accesibilidad**: Todos los componentes deben tener atributos `aria-label` o `aria-describedtext` según sea necesario. Los colores deben tener contraste mínimo de 4.5:1 (AA WCAG) para texto normal y 3:1 para grande.
  - **Responsive**: Usar las clases de breakpoints de Bootstrap (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`) para diseño responsivo. El contenido debe verse bien en móviles primero (`mobile-first`).
- **Estados de form y interacción**:
  - Estados `:focus`, `:active`, `:disabled` deben estilizar usando las variables de `GUIA_VISUAL.md` y clases `.focus-ring` o `.disabled` de Bootstrap.
  - Evitar estilos `!important` salvo en casos excepcionales documentados.
- **Sin emojis** en commits, mensajes de UI, changelog ni código: la guía visual (`GUIA_VISUAL.md`) lo prohíbe. Usar texto plano en su lugar.

## 9. Historial de Versiones (Changelog)

Cada versión publicada **DEBE** documentar sus cambios en `docs/CHANGELOG.md` para generar un historial con la información de cada versión y los commits asociados.

1. **Entrada por versión**: agregar una entrada con número de versión, fecha, resumen de cambios (UI, lógica, estilos, service worker) y la versión de `CACHE_VERSION` correspondiente.
2. **Commits de la versión**: listar los commits (hash corto + mensaje) que conforman la versión, agrupados bajo la entrada de versión.
3. **Formato de entrada** (ejemplo):
   ```markdown
   ## v1.2.0 — 2026-10-15 (SW v25)

   ### Cambios
   - Teclado numérico en inputs de cantidad/precio (`inputMode="numeric"`).
   - Retroalimentación táctil (`:active`) en botones y `.nav-item`.
   - Bloqueo de scroll del fondo al abrir modales/drawers (`body.no-scroll`).
   - `font-size: 16px` en inputs para evitar auto-zoom en iOS.
   - `overscroll-behavior: contain` en `html, body` para parar el rebote elástico.

   ### Commits
   - c177e6a feat(mobile): numeric keyboard, tap feedback, scroll lock, font size, overscroll contain (SW v24 → v25)
   ```
4. **Actualizar en cada release**: al crear una tag o release, cerrar la entrada anterior y añadir la nueva con sus commits.

## 10. Contexto General del Proyecto

- **Nombre:** IndiAR
- **Backend:** Flask (Python).
- **Frontend:** Vue 3 + Vite + Bootstrap 5.
- **Base de datos:** MySQL.
- **ORM:** SQLAlchemy.
- **Entorno:** Todo se ejecuta mediante contenedores Docker (`docker compose`).
- **Secretos:** El archivo `.env` almacena variables sensibles y **nunca** debe comitearse.
- **PWA:** La aplicación Progressive Web App requiere versionado de service worker en cada commit con cambios de UI.
