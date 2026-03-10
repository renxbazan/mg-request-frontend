import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { customersApi, CustomerDto } from '../api/customers'
import { catalogsApi } from '../api/catalogs'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import IconButton from '../components/IconButton'
import FormField from '../components/FormField'
import Modal from '../components/Modal'

export default function CustomerList() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [list, setList] = useState<CustomerDto[]>([])
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([])
  const [filterCompanyId, setFilterCompanyId] = useState<number | ''>('')
  const [filterEmployee, setFilterEmployee] = useState<boolean | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', companyId: 0, employee: false })
  const [editingItem, setEditingItem] = useState<CustomerDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const isCompanyAdmin = user?.companyId != null
  const fixedCompanyId = user?.companyId ?? 0

  const load = () => {
    setLoading(true)
    const companyId = filterCompanyId === '' ? undefined : filterCompanyId
    const employeesOnly = filterEmployee === '' ? undefined : filterEmployee === true
    customersApi
      .list(companyId, employeesOnly)
      .then(setList)
      .catch((e) => setError(getApiErrorMessage(e, t, t('common.errorSave'))))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    catalogsApi.companies().then(setCompanies).catch(() => setCompanies([]))
  }, [])
  useEffect(() => {
    load()
  }, [filterCompanyId, filterEmployee])

  const openCreate = () => {
    setEditingItem(null)
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      companyId: isCompanyAdmin ? fixedCompanyId : (companies[0]?.id ?? 0),
      employee: false,
    })
    setModalOpen(true)
  }

  const openEdit = (c: CustomerDto) => {
    setEditingItem(c)
    setForm({
      firstName: c.firstName ?? '',
      lastName: c.lastName ?? '',
      email: c.email ?? '',
      companyId: c.companyId ?? 0,
      employee: c.employee ?? false,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      companyId: isCompanyAdmin ? fixedCompanyId : (companies[0]?.id ?? 0),
      employee: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (editingItem) {
        await customersApi.update(editingItem.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || undefined,
          companyId: form.companyId || undefined,
          employee: form.employee,
        })
      } else {
        await customersApi.create({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || undefined,
          companyId: form.companyId || undefined,
          employee: form.employee,
        })
      }
      closeModal()
      load()
    } catch (e) {
      setError(getApiErrorMessage(e, t, t('common.errorSave')))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (c: CustomerDto) => {
    if (!confirm(t('customers.deleteConfirm', { firstName: c.firstName ?? '', lastName: c.lastName ?? '' }))) return
    setError('')
    try {
      await customersApi.delete(c.id)
      load()
    } catch (e) {
      setError(getApiErrorMessage(e, t, t('common.errorDelete')))
    }
  }

  const companyById = Object.fromEntries(companies.map((c) => [c.id, c]))

  if (loading && list.length === 0) return <p>{t('customers.loading')}</p>

  return (
    <div>
      <PageHeader
        title={t('customers.title')}
        actions={<Button variant="primary" onClick={openCreate}>{t('customers.newPerson')}</Button>}
      />
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{error}</p>}

      <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <label>
          {t('customers.company')}:
          <select className="input" value={filterCompanyId} onChange={(e) => setFilterCompanyId(e.target.value === '' ? '' : Number(e.target.value))} style={{ marginLeft: 8, width: 'auto' }}>
            <option value="">{t('customers.filterAll')}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          {t('customers.staffOnly')}:
          <select className="input" value={String(filterEmployee)} onChange={(e) => setFilterEmployee(e.target.value === '' ? '' : e.target.value === 'true')} style={{ marginLeft: 8, width: 'auto' }}>
            <option value="">{t('customers.no')}</option>
            <option value="true">{t('customers.yes')}</option>
          </select>
        </label>
      </div>

      {list.length === 0 ? (
        <Card><p style={{ margin: 0 }}>{t('customers.noItems')}</p></Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'visible' }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>{t('common.name')}</th>
                  <th>{t('customers.email')}</th>
                  <th>{t('customers.company')}</th>
                  <th>{t('customers.employee')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.firstName} {c.lastName}</td>
                    <td>{c.email ?? '-'}</td>
                    <td>{c.companyId != null ? (companyById[c.companyId]?.name ?? c.companyId) : '-'}</td>
                    <td>{c.employee ? t('customers.yes') : t('customers.no')}</td>
                    <td>
                      <div className="table-actions">
                        <IconButton icon="edit" title={t('common.edit')} variant="secondary" onClick={() => openEdit(c)} />
                        <IconButton icon="userPlus" title={t('customers.createUser')} variant="secondary" onClick={() => navigate('/admin/users', { state: { prefillCustomerId: c.id } })} />
                        <IconButton icon="delete" title={t('common.delete')} variant="danger" onClick={() => handleDelete(c)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? t('customers.editPerson') : t('customers.newPerson')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button type="submit" form="customer-form" variant="primary" disabled={submitting}>
              {submitting ? t('common.saving') : editingItem ? t('common.saveChanges') : t('customers.createPerson')}
            </Button>
          </>
        }
      >
        <form id="customer-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <FormField label={t('customers.firstName')} required>
                <input type="text" className="input" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required />
              </FormField>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <FormField label={t('customers.lastName')} required>
                <input type="text" className="input" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required />
              </FormField>
            </div>
          </div>
          <FormField label={t('customers.email')}>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </FormField>
          {isCompanyAdmin ? (
            <FormField label={t('customers.company')}>
              <span className="input" style={{ display: 'block', background: 'var(--color-bg-muted)', color: 'var(--color-text-muted)' }}>
                {companies.find((c) => c.id === fixedCompanyId)?.name ?? fixedCompanyId}
              </span>
            </FormField>
          ) : (
            <FormField label={t('customers.company')}>
              <select className="input" value={form.companyId} onChange={(e) => setForm((f) => ({ ...f, companyId: Number(e.target.value) }))}>
                <option value={0}>{t('common.none')}</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--spacing-md)' }}>
            <input type="checkbox" checked={form.employee} onChange={(e) => setForm((f) => ({ ...f, employee: e.target.checked }))} />
            {t('customers.isEmployee')}
          </label>
        </form>
      </Modal>
    </div>
  )
}
