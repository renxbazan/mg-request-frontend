import React, { useState, useMemo, useRef, useEffect, useId } from 'react'

export interface AutocompleteProps<T> {
  options: T[]
  value: number | ''
  onChange: (value: number | '') => void
  getOptionLabel: (item: T) => string
  getOptionId: (item: T) => number
  /** Placeholder when no value selected (replaces filterPlaceholder/selectPlaceholder) */
  filterPlaceholder?: string
  selectPlaceholder?: string
  filterFn?: (item: T, query: string) => boolean
  required?: boolean
  style?: React.CSSProperties
  /** Optional grouping: groupKey is used as group label in dropdown */
  getGroupKey?: (item: T) => string | number | null
  getGroupLabel?: (groupKey: string | number | null) => string
  /** Identificador estable para tests E2E. */
  testId?: string
}

const defaultFilter = <T,>(item: T, query: string, getLabel: (i: T) => string): boolean => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return getLabel(item).toLowerCase().includes(q)
}

export default function Autocomplete<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionId,
  filterPlaceholder = 'Buscar...',
  selectPlaceholder = 'Seleccione',
  filterFn,
  required = false,
  style,
  getGroupKey,
  getGroupLabel,
  testId,
}: AutocompleteProps<T>) {
  const [open, setOpen] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const baseId = useId()
  const listId = `${baseId}-list`

  const selectedOption = useMemo(
    () => (value === '' ? null : options.find((o) => getOptionId(o) === value) ?? null),
    [options, value, getOptionId],
  )

  const filteredOptions = useMemo(() => {
    const fn = filterFn ?? ((item: T, q: string) => defaultFilter(item, q, getOptionLabel))
    return options.filter((item) => fn(item, filterQuery))
  }, [options, filterQuery, filterFn, getOptionLabel])

  const grouped = useMemo(() => {
    if (!getGroupKey || !getGroupLabel) return null
    const map = new Map<string | number | null, T[]>()
    for (const item of filteredOptions) {
      const key = getGroupKey(item)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }, [filteredOptions, getGroupKey, getGroupLabel])

  /** Flat list of options in display order (for keyboard navigation) */
  const flatOptions = useMemo(() => {
    if (grouped && getGroupLabel) {
      return Array.from(grouped.entries())
        .sort(([a], [b]) => {
          const aVal = a == null || a === '' || a === 0 ? null : a
          const bVal = b == null || b === '' || b === 0 ? null : b
          if (aVal == null) return 1
          if (bVal == null) return -1
          return String(aVal).localeCompare(String(bVal))
        })
        .flatMap(([, items]) => items)
    }
    return filteredOptions
  }, [grouped, getGroupLabel, filteredOptions])

  const placeholder = filterPlaceholder || selectPlaceholder

  const displayValue = open ? filterQuery : selectedOption != null ? getOptionLabel(selectedOption) : ''

  const openDropdown = () => {
    if (!open) {
      setFilterQuery(selectedOption != null ? getOptionLabel(selectedOption) : '')
      setOpen(true)
    }
  }

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  useEffect(() => {
    if (open) setHighlightIndex(0)
  }, [open, filterQuery])

  useEffect(() => {
    if (!open || flatOptions.length === 0) return
    const el = listRef.current
    if (!el) return
    const child = el.children[highlightIndex] as HTMLElement | undefined
    child?.scrollIntoView({ block: 'nearest' })
  }, [highlightIndex, open, flatOptions.length])

  const select = (option: T) => {
    onChange(getOptionId(option))
    setFilterQuery('')
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        setFilterQuery(selectedOption != null ? getOptionLabel(selectedOption) : '')
        setOpen(true)
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      setFilterQuery(selectedOption != null ? getOptionLabel(selectedOption) : '')
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => (i + 1) % Math.max(1, flatOptions.length))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => (flatOptions.length ? (i - 1 + flatOptions.length) % flatOptions.length : 0))
      return
    }
    if (e.key === 'Enter' && flatOptions.length > 0) {
      e.preventDefault()
      select(flatOptions[highlightIndex])
      return
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }} data-testid={testId}>
      <input
        type="text"
        className="input"
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => {
          const q = e.target.value
          setFilterQuery(q)
          setOpen(true)
          if (q === '' && value !== '' && !required) onChange('')
        }}
        onFocus={openDropdown}
        onKeyDown={handleKeyDown}
        style={{ width: '100%' }}
        autoComplete="off"
        required={required && value === ''}
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listId}
        id={baseId}
      />
      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label={placeholder}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            margin: 0,
            marginTop: 2,
            padding: 0,
            listStyle: 'none',
            maxHeight: 220,
            overflowY: 'auto',
            background: 'var(--color-bg, #fff)',
            border: '1px solid var(--color-border, #ddd)',
            borderRadius: 'var(--radius, 4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          {grouped && getGroupLabel
            ? Array.from(grouped.entries())
                .sort(([a], [b]) => {
                  const aVal = a == null || a === '' || a === 0 ? null : a
                  const bVal = b == null || b === '' || b === 0 ? null : b
                  if (aVal == null) return 1
                  if (bVal == null) return -1
                  return String(aVal).localeCompare(String(bVal))
                })
                .map(([groupKey, items]) => (
                  <React.Fragment key={groupKey ?? 'none'}>
                    <li
                      style={{
                        padding: '4px 12px 2px',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 600,
                        listStyle: 'none',
                      }}
                    >
                      {getGroupLabel(groupKey)}
                    </li>
                    {items.map((item) => {
                      const id = getOptionId(item)
                      const label = getOptionLabel(item)
                      const flatIdx = flatOptions.findIndex((o) => getOptionId(o) === id)
                      const isHighlighted = flatIdx === highlightIndex
                      return (
                        <li
                          key={id}
                          role="option"
                          aria-selected={value === id}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            background: isHighlighted ? 'var(--color-bg-hover, #f0f0f0)' : undefined,
                          }}
                          onMouseEnter={() => setHighlightIndex(flatIdx)}
                          onClick={() => select(item)}
                        >
                          {label}
                        </li>
                      )
                    })}
                  </React.Fragment>
                ))
            : filteredOptions.map((item) => {
                const id = getOptionId(item)
                const label = getOptionLabel(item)
                const flatIdx = flatOptions.findIndex((o) => getOptionId(o) === id)
                const isHighlighted = flatIdx === highlightIndex
                return (
                  <li
                    key={id}
                    role="option"
                    aria-selected={value === id}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      background: isHighlighted ? 'var(--color-bg-hover, #f0f0f0)' : undefined,
                    }}
                    onMouseEnter={() => setHighlightIndex(flatIdx)}
                    onClick={() => select(item)}
                  >
                    {label}
                  </li>
                )
              })}
        </ul>
      )}
    </div>
  )
}
