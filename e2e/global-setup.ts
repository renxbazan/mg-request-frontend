// Setup global vacío: los datos E2E (usuarios, personas, etc.)
// se crean vía migraciones Flyway en la BD de test.
// Mantener este archivo por compatibilidad con la config de Playwright.
export default async function globalSetup() {
  // no-op
}

