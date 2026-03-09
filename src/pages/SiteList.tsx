import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { catalogsApi, SiteDto, SiteCreateDto, CompanyDto } from '../api/catalogs'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import FormField from '../components/FormField'
import Modal from '../components/Modal'

export default function SiteList() {
  const { t } = useTranslation()
  const [list, setList] = useState<SiteDto[]>([])
  const [companies, setCompanies] = useState<CompanyDto[]>([])
  const [filterCompanyId, setFilterCompanyId] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<SiteCreateDto>({ name: '', description: '', companyId: 0 })
  const [editingItem, setEditingItem] = useState<SiteDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const loadSites = () => {
    const id = filterCompanyId === '' ? undefined : filterCompanyId
    catalogsApi.sites(id).then(setList).catch(() => setList([]))
  }

  useEffect(() => {
    Promise.all([catalogsApi.companies(), catalogsApi.sites()])
      .then(([c, s]) => {
        setCompanies(c)
        setList(s)
        if (c.length && form.companyId === 0) setForm((f) => ({ ...f, companyId: c[0].id }))
      })
      .catch((err) => setError(getApiErrorMessage(err, t, t('common.errorSave'))))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading) loadSites()
  }, [filterCompanyId])

  const openCreate = () => {
    setEditingItem(null)
    setForm({ name: '', description: '', companyId: companies[0]?.id ?? 0 })
    setModalOpen(true)
  }

  const openEdit = (s: SiteDto) => {
    setEditingItem(s)
    setForm({ name: s.name, description: s.description ?? '', companyId: s.companyId ?? 0 })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setForm({ name: '', description: '', companyId: companies[0]?.id ?? 0 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.companyId === 0) {
      setError(t('sites.selectCompany'))
      return
    }
    setError('')
    setSubmitting(true)
    try {
      if (editingItem) {
        await catalogsApi.updateSite(editingItem.id, form)
      } else {
        await catalogsApi.createSite(form)
      }
      closeModal()
      loadSites()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorSave')))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (s: SiteDto) => {
    if (!confirm(t('sites.deleteConfirm', { name: s.name }))) return
    setError('')
    try {
      await catalogsApi.deleteSite(s.id)
      loadSites()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorDelete')))
    }
  }

  const companyById = Object.fromEntries(companies.map((c) => [c.id, c]))

  if (loading) return <p>{t('sites.loading')}</p>

  return (
    <div>
      <PageHeader
        title={t('sites.title')}
        actions={<Button variant="primary" onClick={openCreate}>{t('sites.newSite')}</Button>}
      />
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{error}</p>}

      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label style={{ marginRight: 8 }}>{t('customers.filterByCompany')}:</label>
        <select
          className="input"
          value={filterCompanyId}
          onChange={(e) => setFilterCompanyId(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ width: 'auto', display: 'inline-block' }}
        >
          <option value="">{t('sites.filterAll')}</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <Card><p style={{ margin: 0 }}>{t('sites.noItems')}</p></Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>{t('common.name')}</th>
                  <th>{t('common.description')}</th>
                  <th>{t('sites.company')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.description ?? '-'}</td>
                    <td>{s.companyId != null ? (companyById[s.companyId]?.name ?? s.companyId) : '-'}</td>
                    <td>
                      <Button variant="secondary" onClick={() => openEdit(s)} style={{ marginRight: 8, padding: '6px 12px' }}>{t('common.edit')}</Button>
                      <Button variant="danger" onClick={() => handleDelete(s)} style={{ padding: '6px 12px' }}>{t('common.delete')}</Button>
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
        title={editingItem ? t('sites.editSite') : t('sites.newSite')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button type="submit" form="site-form" variant="primary" disabled={submitting}>
              {submitting ? t('common.saving') : editingItem ? t('common.saveChanges') : t('sites.createSite')}
            </Button>
          </>
        }
      >
        <form id="site-form" onSubmit={handleSubmit}>
          <FormField label={t('sites.company')} required>
            <select
              className="input"
              value={form.companyId}
              onChange={(e) => setForm((f) => ({ ...f, companyId: Number(e.target.value) }))}
              required
            >
              <option value={0}>{t('common.select')}</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label={t('common.name')} required>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </FormField>
          <FormField label={t('common.description')}>
            <input
              type="text"
              className="input"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  )
}
