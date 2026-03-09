interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
}

const STAR_FILLED = '★'
const STAR_EMPTY = '☆'

export default function StarRating({ value, onChange, readOnly = false }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <span
      style={{
        display: 'inline-flex',
        gap: 2,
        fontSize: 24,
        color: 'var(--color-warning, #f1c40f)',
        cursor: readOnly ? 'default' : 'pointer',
      }}
      role={readOnly ? 'img' : undefined}
      aria-label={readOnly ? `Rating: ${value} of 5` : undefined}
    >
      {stars.map((star) => {
        const filled = star <= value
        return (
          <span
            key={star}
            onClick={() => !readOnly && onChange?.(star)}
            onKeyDown={(e) => {
              if (readOnly) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onChange?.(star)
              }
            }}
            role={readOnly ? undefined : 'button'}
            tabIndex={readOnly ? undefined : 0}
            style={{
              color: filled ? 'var(--color-warning, #f1c40f)' : 'var(--color-text-muted, #999)',
            }}
          >
            {filled ? STAR_FILLED : STAR_EMPTY}
          </span>
        )
      })}
    </span>
  )
}
