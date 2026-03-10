import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { catalogsApi, CompanyDto, CompanyCreateDto } from '../api/catalogs'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import IconButton from '../components/IconButton'
import FormField from '../components/FormField'
import Modal from '../components/Modal'

export default function CompanyList() {
  const { t } = useTranslation()
  const [list, setList] = useState<CompanyDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CompanyCreateDto>({ name: '', description: '', companyType: 'COMPANY' })
  const [editingItem, setEditingItem] = useState<CompanyDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = () => {
    setLoading(true)
    catalogsApi
      .companies()
      .then(setList)
      .catch((err) => setError(getApiErrorMessage(err, t, t('common.errorSave'))))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditingItem(null)
    setForm({ name: '', description: '', companyType: 'COMPANY' })
    setModalOpen(true)
  }

  const openEdit = (c: CompanyDto) => {
    setEditingItem(c)
    setForm({ name: c.name, description: c.description ?? '', companyType: c.companyType })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setForm({ name: '', description: '', companyType: 'COMPANY' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (editingItem) {
        await catalogsApi.updateCompany(editingItem.id, form)
      } else {
        await catalogsApi.createCompany(form)
      }
      closeModal()
      load()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorSave')))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (c: CompanyDto) => {
    if (!confirm(t('companies.deleteConfirm', { name: c.name }))) return
    setError('')
    try {
      await catalogsApi.deleteCompany(c.id)
      load()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorDelete')))
    }
  }

  if (loading) return <p>{t('companies.loading')}</p>

  return (
    <div>
      <PageHeader
        title={t('companies.title')}
        actions={<Button variant="primary" onClick={openCreate} data-testid="companies-new">{t('companies.newCompany')}</Button>}
      />
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{error}</p>}

      {list.length === 0 ? (
        <Card><p style={{ margin: 0 }}>{t('companies.noItems')}</p></Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'visible' }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>{t('common.name')}</th>
                  <th>{t('common.description')}</th>
                  <th>{t('companies.type')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.description ?? '-'}</td>
                    <td>{c.companyType}</td>
                    <td>
                      <div className="table-actions">
                        <IconButton icon="edit" title={t('common.edit')} variant="secondary" onClick={() => openEdit(c)} />
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
        title={editingItem ? t('companies.editCompany') : t('companies.newCompany')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal} data-testid="modal-cancel">{t('common.cancel')}</Button>
            <Button type="submit" form="company-form" variant="primary" disabled={submitting} data-testid="modal-submit">
              {submitting ? t('common.saving') : editingItem ? t('common.saveChanges') : t('companies.createCompany')}
            </Button>
          </>
        }
      >
        <form id="company-form" onSubmit={handleSubmit}>
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
          <FormField label={t('companies.type')}>
            <select
              className="input"
              value={form.companyType}
              onChange={(e) => setForm((f) => ({ ...f, companyType: e.target.value }))}
            >
              <option value="COMPANY">{t('companies.typeCompany')}</option>
              <option value="SCHOOL">{t('companies.typeSchool')}</option>
            </select>
          </FormField>
        </form>
      </Modal>
    </div>
  )
}
