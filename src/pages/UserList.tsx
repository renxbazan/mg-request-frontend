import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usersApi, UserDto } from '../api/users'
import { customersApi, CustomerDto } from '../api/customers'
import { profilesApi, ProfileDto } from '../api/profiles'
import { catalogsApi, CompanyDto } from '../api/catalogs'
import { useAuth } from '../auth/AuthContext'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import IconButton from '../components/IconButton'
import FormField from '../components/FormField'
import Autocomplete from '../components/Autocomplete'
import Modal from '../components/Modal'

function customerOptionLabel(c: CustomerDto): string {
  const name = `${c.lastName}, ${c.firstName}`
  return c.email ? `${name} · ${c.email}` : name
}

export default function UserList() {
  const { t } = useTranslation()
  const { user: currentUser, refreshMe } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [list, setList] = useState<UserDto[]>([])
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [companies, setCompanies] = useState<CompanyDto[]>([])
  const [profiles, setProfiles] = useState<ProfileDto[]>([])
  const [sites, setSites] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', customerId: 0, profileId: 0, siteId: 0, locale: 'es' as string })
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<UserDto | null>(null)
  const [editForm, setEditForm] = useState({ customerId: 0, profileId: 0, siteId: 0 as number | null, locale: 'es' as string })
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null)
  const [passwordNew, setPasswordNew] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    usersApi
      .list()
      .then(setList)
      .catch((e) => setError(getApiErrorMessage(e, t, t('common.errorSave'))))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    Promise.all([customersApi.list(), profilesApi.list(), catalogsApi.sites(), catalogsApi.companies()])
      .then(([c, p, s, companiesList]) => {
        setCustomers(c)
        setProfiles(p)
        setSites(s)
        setCompanies(companiesList)
        const prefillId = (location.state as { prefillCustomerId?: number } | null)?.prefillCustomerId
        if (prefillId != null && c.some((x) => x.id === prefillId)) {
          setForm((f) => ({
            ...f,
            customerId: prefillId,
            profileId: p.length ? p[0].id : 0,
            siteId: s.length ? s[0].id : 0,
          }))
          setCreateModalOpen(true)
          navigate(location.pathname, { replace: true, state: {} })
        } else {
          if (form.customerId === 0 && c.length) setForm((f) => ({ ...f, customerId: c[0].id }))
          if (form.profileId === 0 && p.length) setForm((f) => ({ ...f, profileId: p[0].id }))
          if (form.siteId === 0 && s.length) setForm((f) => ({ ...f, siteId: s[0].id }))
        }
      })
      .catch(() => {})
  }, [])

  const openCreateModal = () => {
    setForm({ username: '', password: '', customerId: customers[0]?.id ?? 0, profileId: profiles[0]?.id ?? 0, siteId: sites[0]?.id ?? 0, locale: 'es' })
    setCreateModalOpen(true)
  }

  const openEditModal = (u: UserDto) => {
    setEditingItem(u)
    setEditForm({
      customerId: u.customerId ?? 0,
      profileId: u.profileId ?? 0,
      siteId: u.siteId ?? 0,
      locale: u.locale === 'en' ? 'en' : 'es',
    })
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setEditingItem(null)
  }

  const openPasswordModal = (userId: number) => {
    setPasswordUserId(userId)
    setPasswordNew('')
    setPasswordError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.customerId === 0 || form.profileId === 0) {
      setError(t('users.selectPersonAndProfile'))
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await usersApi.create({
        username: form.username,
        password: form.password || undefined,
        customerId: form.customerId,
        profileId: form.profileId,
        siteId: form.siteId || null,
        locale: form.locale,
      })
      setCreateModalOpen(false)
      load()
    } catch (e) {
      setError(getApiErrorMessage(e, t, t('users.errorCreate')))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || editForm.customerId === 0 || editForm.profileId === 0) return
    setError('')
    setSubmitting(true)
    try {
      await usersApi.update(editingItem.id, {
        customerId: editForm.customerId,
        profileId: editForm.profileId,
        siteId: (editForm.siteId === 0 || editForm.siteId == null) ? null : editForm.siteId,
        locale: editForm.locale,
      })
      closeEditModal()
      load()
      if (currentUser && editingItem.id === currentUser.userId) {
        await refreshMe()
      }
    } catch (e) {
      setError(getApiErrorMessage(e, t, t('common.errorSave')))
    } finally {
      setSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordUserId == null || !passwordNew.trim()) return
    setPasswordError('')
    setPasswordSubmitting(true)
    try {
      await usersApi.changePassword(passwordUserId, passwordNew.trim())
      setPasswordUserId(null)
      setPasswordNew('')
    } catch (e) {
      setPasswordError(getApiErrorMessage(e, t, t('changePassword.errorGeneric')))
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const handleDelete = async (u: UserDto) => {
    if (!confirm(t('users.deleteConfirm', { name: u.username }))) return
    setError('')
    try {
      await usersApi.delete(u.id)
      load()
    } catch (e) {
      setError(getApiErrorMessage(e, t, t('common.errorDelete')))
    }
  }

  const customerById = Object.fromEntries(customers.map((c) => [c.id, c]))
  const profileById = Object.fromEntries(profiles.map((p) => [p.id, p]))
  const siteById = Object.fromEntries(sites.map((s) => [s.id, s]))
  const companyById = Object.fromEntries(companies.map((c) => [c.id, c]))

  const customerFilterFn = (c: CustomerDto, query: string) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      false
    )
  }

  if (loading && list.length === 0) return <p>{t('users.loading')}</p>

  return (
    <div>
      <PageHeader
        title={t('users.title')}
        actions={<Button variant="primary" onClick={openCreateModal}>{t('users.newUser')}</Button>}
      />
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{error}</p>}

      {list.length === 0 ? (
        <Card><p style={{ margin: 0 }}>{t('users.noItems')}</p></Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'visible' }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>{t('users.username')}</th>
                  <th>{t('users.person')}</th>
                  <th>{t('users.profile')}</th>
                  <th>{t('users.site')}</th>
                  <th>{t('users.language')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => {
                  const cust = u.customerId != null ? customerById[u.customerId] : null
                  const prof = u.profileId != null ? profileById[u.profileId] : null
                  const sit = u.siteId != null ? siteById[u.siteId] : null
                  return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{cust ? `${cust.firstName} ${cust.lastName}` : (u.customerId ?? '-')}</td>
                      <td>{prof ? prof.description : (u.profileId ?? '-')}</td>
                      <td>{sit ? sit.name : (u.siteId ?? '-')}</td>
                      <td>{u.locale === 'en' ? t('users.languageEn') : t('users.languageEs')}</td>
                      <td className="td-actions">
                        <div className="table-actions">
                          <IconButton icon="edit" title={t('common.edit')} variant="secondary" onClick={() => openEditModal(u)} />
                          <IconButton icon="key" title={t('users.changePassword')} variant="secondary" onClick={() => openPasswordModal(u.id)} />
                          <IconButton icon="delete" title={t('common.delete')} variant="danger" onClick={() => handleDelete(u)} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={t('users.newUser')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" form="user-create-form" variant="primary" disabled={submitting}>
              {submitting ? t('common.saving') : t('users.createUser')}
            </Button>
          </>
        }
      >
        <form id="user-create-form" onSubmit={handleSubmit}>
          <FormField label={t('users.username')} required>
            <input type="text" className="input" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required />
          </FormField>
          <FormField label={t('users.password')} required>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
          </FormField>
          <FormField label={t('users.person')} required>
            <Autocomplete
              options={customers}
              value={form.customerId}
              onChange={(v) => setForm((f) => ({ ...f, customerId: v || 0 }))}
              getOptionLabel={customerOptionLabel}
              getOptionId={(c) => c.id}
              filterPlaceholder={t('users.searchPerson')}
              selectPlaceholder={t('users.selectPerson')}
              filterFn={customerFilterFn}
              required
              getGroupKey={(c) => c.companyId ?? 0}
              getGroupLabel={(key) => (key === 0 || key === null ? t('users.noCompany') : (companyById[key as number]?.name ?? String(key)))}
            />
          </FormField>
          <FormField label={t('users.profile')} required>
            <select className="input" value={form.profileId} onChange={(e) => setForm((f) => ({ ...f, profileId: Number(e.target.value) }))} required>
              <option value={0}>{t('common.select')}</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.description}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t('users.site')}>
            <select className="input" value={form.siteId} onChange={(e) => setForm((f) => ({ ...f, siteId: Number(e.target.value) }))}>
              <option value={0}>{t('common.none')}</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t('users.language')}>
            <select className="input" value={form.locale} onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value }))}>
              <option value="es">{t('users.languageEs')}</option>
              <option value="en">{t('users.languageEn')}</option>
            </select>
          </FormField>
        </form>
      </Modal>

      <Modal
        open={editModalOpen}
        onClose={closeEditModal}
        title={editingItem ? `${t('users.editUser')}: ${editingItem.username}` : t('users.editUser')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeEditModal}>{t('common.cancel')}</Button>
            <Button type="submit" form="user-edit-form" variant="primary" disabled={submitting}>
              {submitting ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </>
        }
      >
        <form id="user-edit-form" onSubmit={handleEditSubmit}>
          <FormField label={t('users.person')} required>
            <Autocomplete
              options={customers}
              value={editForm.customerId}
              onChange={(v) => setEditForm((f) => ({ ...f, customerId: v || 0 }))}
              getOptionLabel={customerOptionLabel}
              getOptionId={(c) => c.id}
              filterPlaceholder={t('users.searchPerson')}
              selectPlaceholder={t('common.select')}
              filterFn={customerFilterFn}
              required
              getGroupKey={(c) => c.companyId ?? 0}
              getGroupLabel={(key) => (key === 0 || key === null ? t('users.noCompany') : (companyById[key as number]?.name ?? String(key)))}
            />
          </FormField>
          <FormField label={t('users.profile')} required>
            <select className="input" value={editForm.profileId} onChange={(e) => setEditForm((f) => ({ ...f, profileId: Number(e.target.value) }))} required>
              <option value={0}>{t('common.select')}</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.description}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t('users.site')}>
            <select className="input" value={editForm.siteId ?? 0} onChange={(e) => setEditForm((f) => ({ ...f, siteId: e.target.value === '0' ? null : Number(e.target.value) }))}>
              <option value={0}>{t('common.none')}</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t('users.language')}>
            <select className="input" value={editForm.locale} onChange={(e) => setEditForm((f) => ({ ...f, locale: e.target.value }))}>
              <option value="es">{t('users.languageEs')}</option>
              <option value="en">{t('users.languageEn')}</option>
            </select>
          </FormField>
        </form>
      </Modal>

      <Modal
        open={passwordUserId != null}
        onClose={() => { setPasswordUserId(null); setPasswordError(''); setPasswordNew(''); }}
        title={t('users.changePassword')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => { setPasswordUserId(null); setPasswordError(''); setPasswordNew(''); }}>{t('common.cancel')}</Button>
            <Button type="submit" form="user-password-form" variant="primary" disabled={passwordSubmitting}>
              {passwordSubmitting ? t('common.saving') : t('common.save')}
            </Button>
          </>
        }
      >
        {passwordError && <p style={{ color: 'var(--color-danger)', margin: '0 0 var(--spacing-md)' }}>{passwordError}</p>}
        <form id="user-password-form" onSubmit={handleChangePassword}>
          <FormField label={t('users.newPassword')} required>
            <input
              type="password"
              className="input"
              value={passwordNew}
              onChange={(e) => setPasswordNew(e.target.value)}
              required
              minLength={4}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  )
}