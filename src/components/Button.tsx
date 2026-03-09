import { Link } from 'react-router-dom'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled,
  onClick,
  href,
  to,
  form,
  className = '',
  style,
  'aria-label': ariaLabel,
  ...rest
}: {
  children: React.ReactNode
  variant?: ButtonVariant
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
  href?: string
  to?: string
  /** Associate with a form by id (for submit buttons outside the form) */
  form?: string
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
  /** Permite pasar atributos como data-testid para E2E. */
  [key: string]: unknown
}) {
  const variantClass = `btn-${variant}`
  const classes = `btn ${variantClass} ${className}`.trim()
  const shared = { className: classes, 'aria-label': ariaLabel, children, ...rest }

  if (to && !disabled) {
    return <Link to={to} {...shared} style={style} />
  }

  if (href && !disabled) {
    return <a href={href} {...shared} style={style} />
  }

  return (
    <button type={type} form={form} className={classes} disabled={disabled} onClick={onClick} aria-label={ariaLabel} style={style} {...rest}>
      {children}
    </button>
  )
}
