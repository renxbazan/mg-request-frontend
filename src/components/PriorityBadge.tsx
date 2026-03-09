import { useTranslation } from 'react-i18next'

const PRIORITY_MAP: Record<string, { key: string; className: string }> = {
  H: { key: 'requests.priorityHigh', className: 'badge-priority-high' },
  M: { key: 'requests.priorityMedium', className: 'badge-priority-medium' },
  L: { key: 'requests.priorityLow', className: 'badge-priority-low' },
}

export default function PriorityBadge({ priority }: { priority: string | null | undefined }) {
  const { t } = useTranslation()
  if (!priority) return <span>-</span>
  const config = PRIORITY_MAP[priority.toUpperCase()]
  if (!config) return <span>{priority}</span>
  const label = t(config.key)
  return (
    <span className={`badge ${config.className}`}>
      {label}
    </span>
  )
}
