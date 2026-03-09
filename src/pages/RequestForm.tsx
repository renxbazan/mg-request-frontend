import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { requestsApi, RequestCreateDto } from '../api/requests'
import { catalogsApi, SiteDto, ServiceCategoryDto, ServiceSubCategoryDto } from '../api/catalogs'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import FormField from '../components/FormField'
import Autocomplete from '../components/Autocomplete'

export default function RequestForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [sites, setSites] = useState<SiteDto[]>([])
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([])
  const [subCategories, setSubCategories] = useState<ServiceSubCategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<RequestCreateDto>({
    siteId: 0,
    serviceCategoryId: 0,
    description: '',
    priority: 'M',
  })

  useEffect(() => {
    Promise.all([catalogsApi.sites(), catalogsApi.serviceCategories()])
      .then(([s, c]) => {
        setSites(s)
        setCategories(c)
        if (s.length) setForm((f) => ({ ...f, siteId: s[0].id }))
        if (c.length) setForm((f) => ({ ...f, serviceCategoryId: c[0].id }))
      })
      .catch((err) => setError(getApiErrorMessage(err, t, t('common.errorSave'))))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (form.serviceCategoryId) {
      catalogsApi.serviceSubCategories(form.serviceCategoryId).then(setSubCategories)
    } else {
      setSubCategories([])
    }
  }, [form.serviceCategoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await requestsApi.create({
        ...form,
        siteId: form.siteId || sites[0]?.id,
        serviceCategoryId: form.serviceCategoryId || categories[0]?.id,
      })
      navigate('/requests')
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('requests.errorCreate')))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>{t('common.loading')}</p>

  return (
    <div>
      <PageHeader title={t('requests.newRequest')} actions={<Button variant="ghost" onClick={() => navigate('/requests')}>{t('common.back')}</Button>} />
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{error}</p>}
      <Card style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
            <FormField label={t('requests.site')} required>
              <Autocomplete
                options={sites}
                value={form.siteId}
                onChange={(v) => setForm((f) => ({ ...f, siteId: v || 0 }))}
                getOptionLabel={(s) => s.name}
                getOptionId={(s) => s.id}
                filterPlaceholder={t('requests.searchSite')}
                selectPlaceholder={t('common.select')}
                required
                testId="request-form-site"
              />
            </FormField>
            <FormField label={t('requests.category')} required>
              <Autocomplete
                options={categories}
                value={form.serviceCategoryId}
                onChange={(v) => setForm((f) => ({ ...f, serviceCategoryId: v || 0 }))}
                getOptionLabel={(c) => c.name}
                getOptionId={(c) => c.id}
                filterPlaceholder={t('requests.searchCategory')}
                selectPlaceholder={t('common.select')}
                required
                testId="request-form-category"
              />
            </FormField>
          </div>
          <FormField label={t('requests.subCategoryOptional')}>
            <Autocomplete
              options={subCategories}
              value={form.serviceSubCategoryId ?? ''}
              onChange={(v) => setForm((f) => ({ ...f, serviceSubCategoryId: v === '' ? undefined : v }))}
              getOptionLabel={(s) => s.name}
              getOptionId={(s) => s.id}
              filterPlaceholder={t('requests.searchSubCategory')}
              selectPlaceholder={t('common.none')}
              testId="request-form-subcategory"
            />
          </FormField>
          <FormField label={t('requests.description')} required>
            <textarea
              className="input"
              data-testid="request-form-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              rows={4}
            />
          </FormField>
          <FormField label={t('requests.priority')}>
            <select
              className="input"
              data-testid="request-form-priority"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            >
              <option value="L">{t('requests.priorityLow')}</option>
              <option value="M">{t('requests.priorityMedium')}</option>
              <option value="H">{t('requests.priorityHigh')}</option>
            </select>
          </FormField>
          <Button type="submit" variant="success" disabled={submitting} data-testid="request-form-submit">
            {submitting ? t('requests.saving') : t('requests.createRequest')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
