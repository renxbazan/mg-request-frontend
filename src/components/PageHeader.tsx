export default function PageHeader({
  title,
  actions,
}: {
  title: string
  actions?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--color-text)',
        }}
      >
        {title}
      </h1>
      {actions ? (
        <div style={{ display: 'flex', gap: 'var(--spacing)', flexWrap: 'wrap' }}>
          {actions}
        </div>
      ) : null}
    </div>
  )
}
