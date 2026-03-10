#!/bin/bash
# Deploy frontend build a S3 para hosting estático.
# Requisitos: AWS CLI configurado, bucket S3 creado con hosting estático.
#
# Uso:
#   ./scripts/deploy-s3.sh [BUCKET_NAME]
#   O con variable de entorno: S3_BUCKET=mi-bucket ./scripts/deploy-s3.sh
#
# Para producción, define VITE_API_BASE_URL antes del build:
#   VITE_API_BASE_URL=https://api.midominio.com npm run build
#   ./scripts/deploy-s3.sh mi-bucket

set -e

# Ejecutar desde la raíz del proyecto frontend
cd "$(dirname "$0")/.."

BUCKET="${1:-$S3_BUCKET}"
if [ -z "$BUCKET" ]; then
  echo "Uso: ./scripts/deploy-s3.sh BUCKET_NAME"
  echo "  o: S3_BUCKET=mi-bucket ./scripts/deploy-s3.sh"
  exit 1
fi

# Build si no existe dist/
if [ ! -d "dist" ]; then
  echo "Ejecutando npm run build..."
  npm run build
fi

echo "Subiendo dist/ a s3://$BUCKET ..."
aws s3 sync dist/ "s3://$BUCKET" --delete --cache-control "public, max-age=31536000, immutable" --exclude "index.html"
aws s3 cp dist/index.html "s3://$BUCKET/index.html" --cache-control "no-cache"

echo "Deploy completado. URL: http://$BUCKET.s3-website-{region}.amazonaws.com"
echo "O usa CloudFront si lo tienes configurado."
