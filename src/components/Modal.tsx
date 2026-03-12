import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Button from './Button'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  /** Optional footer (e.g. Cancel + Submit). If not provided, a default Close button is shown. */
  footer?: React.ReactNode
  /** Optional max width in px (default 480). Use for content-heavy modals (e.g. approvers). */
  maxWidth?: number
}

export default function Modal({ open, onClose, title, children, footer, maxWidth = 480 }: ModalProps) {
  const { t } = useTranslation()
  useEffect(() => {
    if (!open) return
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'relative',
          background: 'var(--color-bg, #fff)',
          borderRadius: 'var(--radius, 6px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          maxWidth,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border, #eee)' }}>
          <h2 id="modal-title" style={{ margin: 0, fontSize: '1.15rem' }}>
            {title}
          </h2>
        </div>
        <div style={{ padding: 'var(--spacing-lg)', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
        <div style={{ padding: 'var(--spacing-lg)', borderTop: '1px solid var(--color-border, #eee)', display: 'flex', gap: 'var(--spacing)', justifyContent: 'flex-end' }}>
          {footer != null ? footer : <Button variant="secondary" onClick={onClose}>{t('common.close')}</Button>}
        </div>
      </div>
    </div>
  )
}
