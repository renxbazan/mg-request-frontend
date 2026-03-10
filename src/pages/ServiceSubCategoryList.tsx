import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { catalogsApi, ServiceSubCategoryDto, ServiceSubCategoryCreateDto, ServiceCategoryDto } from '../api/catalogs'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import IconButton from '../components/IconButton'
import FormField from '../components/FormField'
import Modal from '../components/Modal'

export default function ServiceSubCategoryList() {
  const { t } = useTranslation()
  const [list, setList] = useState<ServiceSubCategoryDto[]>([])
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([])
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<ServiceSubCategoryCreateDto>({ name: '', description: '', serviceCategoryId: 0 })
  const [editingItem, setEditingItem] = useState<ServiceSubCategoryDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const loadSubCategories = () => {
    const id = filterCategoryId === '' ? undefined : filterCategoryId
    catalogsApi.serviceSubCategories(id).then(setList).catch(() => setList([]))
  }

  useEffect(() => {
    Promise.all([catalogsApi.serviceCategories(), catalogsApi.serviceSubCategories()])
      .then(([c, s]) => {
        setCategories(c)
        setList(s)
        if (c.length && form.serviceCategoryId === 0) setForm((f) => ({ ...f, serviceCategoryId: c[0].id }))
      })
      .catch((err) => setError(getApiErrorMessage(err, t, t('common.errorSave'))))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading) loadSubCategories()
  }, [filterCategoryId])

  const openCreate = () => {
    setEditingItem(null)
    setForm({ name: '', description: '', serviceCategoryId: categories[0]?.id ?? 0 })
    setModalOpen(true)
  }

  const openEdit = (s: ServiceSubCategoryDto) => {
    setEditingItem(s)
    setForm({ name: s.name, description: s.description ?? '', serviceCategoryId: s.serviceCategoryId ?? 0 })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setForm({ name: '', description: '', serviceCategoryId: categories[0]?.id ?? 0 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.serviceCategoryId === 0) {
      setError(t('serviceSubCategories.selectCategory'))
      return
    }
    setError('')
    setSubmitting(true)
    try {
      if (editingItem) {
        await catalogsApi.updateServiceSubCategory(editingItem.id, form)
      } else {
        await catalogsApi.createServiceSubCategory(form)
      }
      closeModal()
      loadSubCategories()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorSave')))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (s: ServiceSubCategoryDto) => {
    if (!confirm(t('serviceSubCategories.deleteConfirm', { name: s.name }))) return
    setError('')
    try {
      await catalogsApi.deleteServiceSubCategory(s.id)
      loadSubCategories()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorDelete')))
    }
  }

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))

  if (loading) return <p>{t('serviceSubCategories.loading')}</p>

  return (
    <div>
      <PageHeader
        title={t('serviceSubCategories.title')}
        actions={<Button variant="primary" onClick={openCreate}>{t('serviceSubCategories.newSubCategory')}</Button>}
      />
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{error}</p>}

      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label style={{ marginRight: 8 }}>{t('serviceSubCategories.filterByCategory')}:</label>
        <select
          className="input"
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ width: 'auto', display: 'inline-block' }}
        >
          <option value="">{t('serviceSubCategories.filterAll')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <Card><p style={{ margin: 0 }}>{t('serviceSubCategories.noItems')}</p></Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'visible' }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>{t('common.name')}</th>
                  <th>{t('common.description')}</th>
                  <th>{t('serviceSubCategories.category')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.description ?? '-'}</td>
                    <td>{s.serviceCategoryId != null ? (categoryById[s.serviceCategoryId]?.name ?? s.serviceCategoryId) : '-'}</td>
                    <td>
                      <div className="table-actions">
                        <IconButton icon="edit" title={t('common.edit')} variant="secondary" onClick={() => openEdit(s)} />
                        <IconButton icon="delete" title={t('common.delete')} variant="danger" onClick={() => handleDelete(s)} />
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
        title={editingItem ? t('serviceSubCategories.editSubCategory') : t('serviceSubCategories.newSubCategory')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button type="submit" form="service-subcategory-form" variant="primary" disabled={submitting}>
              {submitting ? t('common.saving') : editingItem ? t('common.saveChanges') : t('serviceSubCategories.createSubCategory')}
            </Button>
          </>
        }
      >
        <form id="service-subcategory-form" onSubmit={handleSubmit}>
          <FormField label={t('serviceSubCategories.category')} required>
            <select
              className="input"
              value={form.serviceCategoryId}
              onChange={(e) => setForm((f) => ({ ...f, serviceCategoryId: Number(e.target.value) }))}
              required
            >
              <option value={0}>{t('common.select')}</option>
              {categories.map((c) => (
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
