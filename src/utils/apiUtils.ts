import { FORBIDDEN_ERROR_MESSAGE } from '../api/client'

/**
 * Convierte un error de una llamada API en mensaje para mostrar.
 * Si es 403, devuelve la traducción de common.forbidden.
 */
export function getApiErrorMessage(
  e: unknown,
  t: (key: string) => string,
  fallback: string
): string {
  if (e instanceof Error && e.message === FORBIDDEN_ERROR_MESSAGE) {
    return t('common.forbidden')
  }
  return e instanceof Error ? e.message : fallback
}
