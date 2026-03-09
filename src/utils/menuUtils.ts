import type { MenuItemDTO } from '../api/auth'

export const URI_TO_NAV_KEY: Record<string, string> = {
  '/': 'nav.home',
  '/requests': 'nav.requests',
  '/requests/new': 'nav.newRequest',
  '/companies': 'nav.companies',
  '/sites': 'nav.sites',
  '/service-categories': 'nav.categories',
  '/service-sub-categories': 'nav.subcategories',
  '/admin/profiles': 'nav.profiles',
  '/admin/customers': 'nav.persons',
  '/admin/users': 'nav.users',
}

export const GROUP_LABEL_KEY: Record<string, string> = {
  'Principal': 'nav.principal',
  'Catálogos': 'nav.catalogs',
  'Admin': 'nav.admin',
}

export interface MenuGroup {
  label: string
  labelKey?: string
  items: { uri: string; labelKey: string; label: string }[]
}

export function buildMenuGroups(items: MenuItemDTO[]): MenuGroup[] {
  const groups: MenuGroup[] = []
  let current: MenuGroup | null = null
  for (const it of items) {
    if (it.type === 'H') {
      current = {
        label: it.description,
        labelKey: GROUP_LABEL_KEY[it.description],
        items: [],
      }
      groups.push(current)
    } else if (it.type === 'N' && it.uri && current) {
      const labelKey = URI_TO_NAV_KEY[it.uri] ?? ''
      current.items.push({ uri: it.uri, labelKey, label: it.description })
    }
  }
  return groups
}
