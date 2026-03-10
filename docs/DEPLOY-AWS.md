# Despliegue en AWS - MG Request

Guía para desplegar el frontend en S3 + CloudFront y el backend en Elastic Beanstalk o ECS.

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

### 2. Build con URL del backend

```bash
cd mg-request-frontend
VITE_API_BASE_URL=https://tu-backend.elasticbeanstalk.com npm run build
```

O si usas CloudFront con múltiples orígenes (S3 + API), puede que uses rutas relativas `/api` y configures CloudFront para enrutar `/api/*` al backend.

### 3. Subir a S3

```bash
./scripts/deploy-s3.sh mg-request-frontend
```

O manualmente:

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

- `SPRING_DATASOURCE_URL` = `jdbc:mysql://tu-rds-endpoint:3306/mgdb`
- `SPRING_DATASOURCE_USERNAME` = usuario RDS
- `SPRING_DATASOURCE_PASSWORD` = contraseña RDS
- `JWT_SECRET` = clave segura
- `JWT_EXPIRATION_MS` = 86400000
- **Mail (Zoho):** `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`. Opcional: `MG_MAIL_OVERRIDE_TO` = lista de correos separados por comas para redirigir todos los envíos (útil en staging; vacío o no definido = destinatarios reales).
- **Enlaces en correos:** `MG_APP_BASE_URL` = URL base del frontend (ej. `https://mg-request.tudominio.com`) para que el botón "View request" en los correos abra la solicitud en la web.
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
- Flyway aplica las migraciones al arrancar el backend

---

## S3 para adjuntos (fotos de solicitudes)

1. Crear un bucket privado (bloquear acceso público):

```bash
aws s3 mb s3://mg-request-attachments-prod --region us-east-1
```

2. Política IAM para el rol o usuario que usa el backend: permitir `s3:PutObject` y `s3:GetObject` sobre `arn:aws:s3:::mg-request-attachments-prod/*`.

3. No es necesario configurar CORS en el bucket porque las subidas se hacen desde el backend (multipart al API), no desde el navegador directamente al S3.

### Bucket de test

- **ARN:** `arn:aws:s3:::mg-work-request-test`
- **Nombre:** `mg-work-request-test`
- **Región:** `us-west-2`

Para usar este bucket en test, configura en el backend:

- `MG_ATTACHMENTS_BUCKET=mg-work-request-test`
- `AWS_REGION=us-west-2`

La política IAM del rol o usuario del backend debe permitir `s3:PutObject` y `s3:GetObject` sobre `arn:aws:s3:::mg-work-request-test/*`.
