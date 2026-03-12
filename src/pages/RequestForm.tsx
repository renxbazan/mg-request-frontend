import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import { requestsApi, RequestCreateDto } from '../api/requests'
import { catalogsApi, SiteDto, ServiceCategoryDto, ServiceSubCategoryDto } from '../api/catalogs'
import { getApiErrorMessage } from '../utils/apiUtils'
import { useAuth } from '../auth/AuthContext'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import FormField from '../components/FormField'
import Autocomplete from '../components/Autocomplete'

const MAX_IMAGES = 5
const COMPRESSION_OPTIONS = { maxSizeMB: 0.3, maxWidthOrHeight: 1600, useWebWorker: true }

type ImagePreview = { file: File; preview: string }

export default function RequestForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sites, setSites] = useState<SiteDto[]>([])
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([])
  const [subCategories, setSubCategories] = useState<ServiceSubCategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<ImagePreview[]>([])
  const [form, setForm] = useState<RequestCreateDto>({
    siteId: 0,
    serviceCategoryId: 0,
    description: '',
    priority: 'M',
  })

  const companyIdForSites = user?.companyId ?? undefined

  useEffect(() => {
    Promise.all([catalogsApi.sites(companyIdForSites), catalogsApi.serviceCategories()])
      .then(([s, c]) => {
        setSites(s)
        setCategories(c)
        if (s.length) setForm((f) => ({ ...f, siteId: s[0].id }))
        if (c.length) setForm((f) => ({ ...f, serviceCategoryId: c[0].id }))
      })
      .catch((err) => setError(getApiErrorMessage(err, t, t('common.errorSave'))))
      .finally(() => setLoading(false))
  }, [companyIdForSites])

  useEffect(() => {
    if (form.serviceCategoryId) {
      catalogsApi.serviceSubCategories(form.serviceCategoryId).then(setSubCategories)
    } else {
      setSubCategories([])
    }
  }, [form.serviceCategoryId])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files
    if (!chosen?.length) return
    const toAdd = images.length + chosen.length <= MAX_IMAGES
      ? Array.from(chosen).filter((f) => f.type.startsWith('image/'))
      : Array.from(chosen).filter((f) => f.type.startsWith('image/')).slice(0, MAX_IMAGES - images.length)
    if (toAdd.length === 0) return
    const compressed: ImagePreview[] = []
    for (const file of toAdd) {
      try {
        const c = await imageCompression(file, COMPRESSION_OPTIONS)
        compressed.push({ file: c, preview: URL.createObjectURL(c) })
      } catch {
        compressed.push({ file, preview: URL.createObjectURL(file) })
      }
    }
    setImages((prev) => [...prev, ...compressed].slice(0, MAX_IMAGES))
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload: RequestCreateDto = {
        ...form,
        siteId: form.siteId || sites[0]?.id,
        serviceCategoryId: form.serviceCategoryId || categories[0]?.id,
      }
      if (images.length > 0) {
        const formData = new FormData()
        formData.append('payload', JSON.stringify(payload))
        images.forEach(({ file }) => formData.append('files', file))
        await requestsApi.createWithAttachments(formData)
      } else {
        await requestsApi.create(payload)
      }
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
                getOptionLabel={(s) => (s.companyName ? `${s.companyName} — ${s.name}` : s.name)}
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

          <FormField label={t('requests.photos')}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing)', alignItems: 'center' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                data-testid="request-form-photos"
              />
              {images.length < MAX_IMAGES && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('requests.addPhotos')}
                </Button>
              )}
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {t('requests.photosHint', { max: MAX_IMAGES })}
              </span>
            </div>
            {images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img
                      src={img.preview}
                      alt=""
                      style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label={t('common.delete')}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'var(--color-danger)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 14,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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
