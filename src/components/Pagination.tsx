import { useTranslation } from 'react-i18next'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const { t } = useTranslation()
  if (totalPages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing)', marginTop: 'var(--spacing-md)' }}>
      <button
        type="button"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
        style={{
          padding: '6px 12px',
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          background: page <= 0 ? 'var(--color-bg-muted)' : 'var(--color-bg)',
          cursor: page <= 0 ? 'not-allowed' : 'pointer',
          fontSize: 14,
        }}
      >
        {t('common.previous')}
      </button>
      <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
        {t('common.page')} {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        style={{
          padding: '6px 12px',
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          background: page >= totalPages - 1 ? 'var(--color-bg-muted)' : 'var(--color-bg)',
          cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
          fontSize: 14,
        }}
      >
        {t('common.next')}
      </button>
    </div>
  )
}
