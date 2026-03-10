# Despliegue en AWS - MG Request

Guía para desplegar el frontend en S3 + CloudFront y el backend en Elastic Beanstalk o ECS.

## URLs de producción

- **Backend (API):** https://api.mgservicesunlimited.com
- **Frontend:** https://request.mgservicesunlimited.com

---

## Preparación del despliegue

### Orden recomendado

1. **Backend:** configurar variables de entorno en Elastic Beanstalk (o ECS), luego desplegar el JAR.
2. **Base de datos:** RDS MySQL creado; Flyway aplica migraciones al arrancar el backend con perfil `prod`.
3. **Frontend:** build con la URL del API de producción, luego subir a S3 (y opcionalmente invalidar CloudFront).

### Checklist antes de desplegar

- [ ] RDS MySQL creado; seguridad: puerto 3306 accesible solo desde el backend.
- [ ] Backend: `SPRING_PROFILES_ACTIVE=prod` y el resto de variables (ver sección Backend).
- [ ] Health check del balanceador de carga apuntando a `GET /health` (código 200).
- [ ] Bucket S3 de adjuntos creado (prod); IAM del backend con `s3:PutObject` y `s3:GetObject`.
- [ ] Frontend: build con `VITE_API_BASE_URL=https://api.mgservicesunlimited.com` antes de subir a S3.

### Health check (load balancer)

- **Path:** `GET /health`
- **Respuesta esperada:** 200 OK, cuerpo `ok`.

---

## Arquitectura

- **Frontend**: S3 (hosting estático) + CloudFront (CDN)
- **Backend**: Elastic Beanstalk (JAR) o ECS (Docker)
- **Base de datos**: RDS MySQL
- **Adjuntos (fotos de solicitudes)**: S3 (bucket privado; el backend genera URLs firmadas para lectura)

---

## Frontend (S3 + CloudFront)

### 1. Crear bucket S3

```bash
aws s3 mb s3://mg-request-frontend --region us-east-1
aws s3 website s3://mg-request-frontend --index-document index.html --error-document index.html
```

(Usa `index.html` como error document para SPA con client-side routing.)

### 2. Build con URL del backend (producción)

Para producción es obligatorio compilar con la URL del API; si no, la app seguirá llamando a localhost o a la URL del último build.

```bash
cd mg-request-frontend
VITE_API_BASE_URL=https://api.mgservicesunlimited.com npm run build
```

### 3. Subir a S3

Si el bucket tiene otro nombre (ej. el que te asigne CloudFront o tu convención), pásalo como argumento:

```bash
./scripts/deploy-s3.sh mg-request-frontend
# o, si tu bucket tiene otro nombre:
./scripts/deploy-s3.sh TU_BUCKET_FRONTEND
```

Recomendación: ejecutar el build del paso 2 justo antes de este paso para no subir un `dist/` antiguo con otra API.

Manual:

```bash
aws s3 sync dist/ s3://mg-request-frontend --delete
```

### 4. CloudFront (opcional, recomendado para producción)

- Crear distribución CloudFront con origen S3
- Para SPA: configurar "Custom Error Response" 403 y 404 → redirect a `/index.html` (200)
- Dominio personalizado: añadir certificado ACM y alias

---

## Backend (Elastic Beanstalk)

### Opción A: Plataforma Java (JAR directo)

1. Crear aplicación EB:

```bash
cd mg-request-backend
mvn clean package -DskipTests
# Crear zip: el JAR debe estar en la raíz o en la estructura que EB espera
zip -r deploy.zip target/request.jar .ebextensions/ Procfile
```

2. En la consola AWS: Elastic Beanstalk → Create application → Java 17 → Upload your code

3. Variables de entorno en la consola EB (Configuration → Software → Environment properties):

- **Perfil:** `SPRING_PROFILES_ACTIVE` = `prod` (obligatorio para producción)
- **Base de datos:** `SPRING_DATASOURCE_URL` = `jdbc:mysql://tu-rds-endpoint:3306/mgdb`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
- **JWT:** `JWT_SECRET` (clave segura), `JWT_EXPIRATION_MS` = `86400000`
- **Mail (Zoho):** `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`. Opcional: `MG_MAIL_OVERRIDE_TO` = lista de correos separados por comas para redirigir todos los envíos (útil en staging; vacío o no definido = destinatarios reales).
- **Enlaces en correos:** `MG_APP_BASE_URL` = `https://request.mgservicesunlimited.com` para que el botón "View request" en los correos abra la solicitud en la web.
- **CORS:** `MG_CORS_ALLOWED_ORIGINS` = `https://request.mgservicesunlimited.com` (o varios separados por coma). Si no se define, se permite `*` (todos los orígenes).
- **Adjuntos (fotos en solicitudes):**
  - `MG_ATTACHMENTS_BUCKET` = nombre del bucket S3 para adjuntos (ej. `mg-request-attachments-prod`). Si no se define, la subida de fotos queda deshabilitada.
  - `AWS_REGION` = región del bucket (ej. `us-east-1`).
  - Credenciales: usar rol IAM de la instancia EB/ECS con política que permita `s3:PutObject` y `s3:GetObject` sobre el bucket, o bien `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` de un usuario IAM con esos permisos.

### Opción B: Plataforma Docker (ECS)

1. Construir y subir imagen a ECR:

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker build -t mg-request-backend .
docker tag mg-request-backend:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/mg-request:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/mg-request:latest
```

2. Crear servicio ECS con la imagen, variables de entorno y conexión a RDS.

---

## RDS MySQL

- Motor: MySQL 8
- Instancia: db.t3.micro (free tier) o db.t3.small
- Crear base de datos `mgdb` (o el nombre que uses)
- Security group: permitir 3306 solo desde el security group del backend (EB o ECS)
- Flyway aplica las migraciones al arrancar el backend. Con perfil **prod** solo se ejecutan las migraciones de `db/migration` (no las de `db/migration/optional`): en producción no se cargan V7 (usuarios E2E) ni V8 (categorías de servicio). La base de datos es siempre incremental (nunca se borra).
- Migraciones que se aplican en prod: V1 (esquema inicial), V2 (seed básico), V3–V4 (estado y locale), V5 (menú y perfiles), V6 (menú Company Admin parcial), V9 (adjuntos), V10 (Company Admin sin Catálogos ni Admin en menú).

---

## S3 para adjuntos (fotos de solicitudes)

1. Crear un bucket privado (bloquear acceso público):

```bash
aws s3 mb s3://mg-request-attachments-prod --region us-east-1
```

2. Política IAM para el rol o usuario que usa el backend: permitir `s3:PutObject` y `s3:GetObject` sobre `arn:aws:s3:::mg-request-attachments-prod/*`.

3. No es necesario configurar CORS en el bucket porque las subidas se hacen desde el backend (multipart al API), no desde el navegador directamente al S3.

### Bucket de producción

- **ARN:** `arn:aws:s3:::mg-work-request-prod`
- **Nombre:** `mg-work-request-prod`
- **Región:** `us-west-2` (Oregón)

En el backend (EB/ECS) configura:

- `MG_ATTACHMENTS_BUCKET=mg-work-request-prod`
- `AWS_REGION=us-west-2`

La política IAM del rol de la instancia EB o del task role de ECS debe permitir `s3:PutObject` y `s3:GetObject` sobre `arn:aws:s3:::mg-work-request-prod/*`.

### Bucket de test

- **ARN:** `arn:aws:s3:::mg-work-request-test`
- **Nombre:** `mg-work-request-test`
- **Región:** `us-west-2`

Para usar este bucket en test, configura en el backend:

- `MG_ATTACHMENTS_BUCKET=mg-work-request-test`
- `AWS_REGION=us-west-2`

La política IAM del rol o usuario del backend debe permitir `s3:PutObject` y `s3:GetObject` sobre `arn:aws:s3:::mg-work-request-test/*`.

---

## Actualización (versión ya desplegada)

Cuando la app ya está en producción y solo subes una nueva versión:

**1. Backend**
```bash
cd mg-request-backend
mvn clean package -DskipTests
zip -r deploy.zip target/request.jar .ebextensions/ Procfile
```
Subir `deploy.zip` en Elastic Beanstalk (Upload and deploy). Las variables de entorno no cambian. Flyway (con perfil prod) aplica las migraciones de `classpath:db/migration` (V1–V6, V9, V10, etc.); aplicará las que falten en la BD.

**Si no se ejecutan migraciones nuevas:** asegúrate de haber hecho `mvn clean package` *después* de tener los nuevos `.sql` en el código; así el JAR incluye los ficheros. Comprueba en EB que está definido `SPRING_PROFILES_ACTIVE=prod`. En RDS puedes revisar la tabla `flyway_schema_history` para ver qué versiones están aplicadas.

**2. Frontend**
```bash
cd mg-request-frontend
VITE_API_BASE_URL=https://api.mgservicesunlimited.com npm run build
./scripts/deploy-s3.sh NOMBRE_BUCKET_FRONTEND
```
Si usas CloudFront, opcionalmente invalidar la caché (Distribution → Invalidations → Create invalidation, objeto `/index.html` o `/*`).

---

## Resumen de comandos (primera vez / referencia)

**Backend (generar JAR y zip para EB):**
```bash
cd mg-request-backend
mvn clean package -DskipTests
zip -r deploy.zip target/request.jar .ebextensions/ Procfile
# Subir deploy.zip en la consola de Elastic Beanstalk
```

**Frontend (build y subir a S3):**
```bash
cd mg-request-frontend
VITE_API_BASE_URL=https://api.mgservicesunlimited.com npm run build
./scripts/deploy-s3.sh NOMBRE_BUCKET_FRONTEND
```
