export default function FormField({
  label,
  id,
  error,
  children,
  required,
}: {
  label: string
  id?: string
  error?: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div style={{ marginBottom: 'var(--spacing-md)' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            marginBottom: 'var(--spacing)',
            fontWeight: 500,
            fontSize: 14,
            color: 'var(--color-text)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
        </label>
      )}
      {children}
      {error && (
        <p
          style={{
            margin: 'var(--spacing) 0 0',
            fontSize: 13,
            color: 'var(--color-danger)',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
