import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { catalogsApi, ServiceCategoryDto, ServiceCategoryCreateDto } from '../api/catalogs'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import FormField from '../components/FormField'
import Modal from '../components/Modal'

export default function ServiceCategoryList() {
  const { t } = useTranslation()
  const [list, setList] = useState<ServiceCategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<ServiceCategoryCreateDto>({ name: '', description: '' })
  const [editingItem, setEditingItem] = useState<ServiceCategoryDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = () => {
    setLoading(true)
    catalogsApi
      .serviceCategories()
      .then(setList)
      .catch((err) => setError(getApiErrorMessage(err, t, t('common.errorSave'))))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditingItem(null)
    setForm({ name: '', description: '' })
    setModalOpen(true)
  }

  const openEdit = (c: ServiceCategoryDto) => {
    setEditingItem(c)
    setForm({ name: c.name, description: c.description ?? '' })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setForm({ name: '', description: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (editingItem) {
        await catalogsApi.updateServiceCategory(editingItem.id, form)
      } else {
        await catalogsApi.createServiceCategory(form)
      }
      closeModal()
      load()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorSave')))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (c: ServiceCategoryDto) => {
    if (!confirm(t('serviceCategories.deleteConfirm', { name: c.name }))) return
    setError('')
    try {
      await catalogsApi.deleteServiceCategory(c.id)
      load()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorDelete')))
    }
  }

  if (loading) return <p>{t('serviceCategories.loading')}</p>

  return (
    <div>
      <PageHeader
        title={t('serviceCategories.title')}
        actions={<Button variant="primary" onClick={openCreate}>{t('serviceCategories.newCategory')}</Button>}
      />
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{error}</p>}

      {list.length === 0 ? (
        <Card><p style={{ margin: 0 }}>{t('serviceCategories.noItems')}</p></Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>{t('common.name')}</th>
                  <th>{t('common.description')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.description ?? '-'}</td>
                    <td>
                      <Button variant="secondary" onClick={() => openEdit(c)} style={{ marginRight: 8, padding: '6px 12px' }}>{t('common.edit')}</Button>
                      <Button variant="danger" onClick={() => handleDelete(c)} style={{ padding: '6px 12px' }}>{t('common.delete')}</Button>
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
        title={editingItem ? t('serviceCategories.editCategory') : t('serviceCategories.newCategory')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button type="submit" form="service-category-form" variant="primary" disabled={submitting}>
              {submitting ? t('common.saving') : editingItem ? t('common.saveChanges') : t('serviceCategories.createCategory')}
            </Button>
          </>
        }
      >
        <form id="service-category-form" onSubmit={handleSubmit}>
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
