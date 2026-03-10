# MG Request - Frontend

Frontend React + TypeScript + Vite para el sistema de gestión de solicitudes MG. Consume la API REST del backend (mg-request).

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
cd mg-request-frontend
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y opcionalmente define:

- `VITE_API_BASE_URL`: URL base del backend. En desarrollo con `npm run dev`, Vite hace proxy de `/api` a `http://localhost:8080`, así que puede quedar vacío.

Para producción, apunta a la URL del backend (por ejemplo `https://api.tudominio.com`).

## Desarrollo

Con el backend corriendo en el puerto 8080 (perfil `test` recomendado para E2E):

```bash
npm run dev
```

Abre http://localhost:3000. El proxy enviará las peticiones a `/api/*` al backend.

## Build

```bash
npm run build
```

La salida queda en `dist/`. Para producción puedes servirla con cualquier servidor estático o desplegarla en S3 + CloudFront. Ver `docs/DEPLOY-AWS.md` para instrucciones de despliegue en AWS.

## Tests E2E (Playwright)

Este proyecto incluye una suite de tests E2E con Playwright situada en `e2e/`:

- Configuración: `playwright.config.ts`
- Fixtures: `e2e/fixtures/*`
- Tests: `e2e/specs/*`

### Requisitos previos

- Backend `mg-request` levantado en `http://localhost:8080` con perfil `test` y base de datos `mgdb_test`:

  ```bash
  cd ../mg-request
  sdk use java 17.0.9-amzn
  mvn spring-boot:run -Dspring-boot.run.profiles=test
  ```

- Frontend levantado en `http://localhost:3000`:

  ```bash
  cd ../mg-request-frontend
  npm run dev
  ```

- Playwright instalado en tu máquina (una sola vez):

  ```bash
  npx playwright install
  ```

### Comandos

- Ejecutar todos los tests E2E en modo headless:

  ```bash
  npm run e2e
  ```

- Ejecutar tests con UI de Playwright:

  ```bash
  npm run e2e:ui
  ```

- Ejecutar tests en modo debug:

  ```bash
  npm run e2e:debug
  ```

### Cobertura de los tests E2E

Los tests E2E actuales validan:

- **Login de usuarios E2E**:
  - `requester_e2e`, `company_admin_e2e`, `worker_e2e` (creados por Flyway en el backend sobre `mgdb_test`).
- **Flujo de solicitudes**:
  - Creación de solicitud por Requester y transición al estado **REJECTED** por Company Admin.
- **Filtros en el listado de solicitudes**:
  - Filtros por estado, prioridad y empresa en `/requests`.
- **Control de acceso 403**:
  - Company Admin recibiendo 403 al intentar crear una Company, mostrando mensaje de error y **sin redirigir al login**.
- **Coherencia de navegación**:
  - Menú y home del Super Admin muestran opciones coherentes con su perfil.

## Funcionalidad

- **Login**: usuario y contraseña; se guarda el JWT y el usuario en localStorage.
- **Inicio**: bienvenida y enlaces a solicitudes, dinámicos según el perfil del usuario.
- **Solicitudes**:
  - Listado de solicitudes (todas, mías, asignadas a mí) según perfil.
  - Formulario para crear una nueva solicitud (sitio, categoría, subcategoría, descripción, prioridad).

El backend debe estar levantado y con al menos los datos de seed (incluidos los usuarios E2E) para poder navegar y ejecutar correctamente los tests E2E.
