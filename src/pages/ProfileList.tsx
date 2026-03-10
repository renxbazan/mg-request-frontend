import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { profilesApi, ProfileDto } from '../api/profiles'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import IconButton from '../components/IconButton'
import FormField from '../components/FormField'
import Modal from '../components/Modal'

export default function ProfileList() {
  const { t } = useTranslation()
  const [list, setList] = useState<ProfileDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [description, setDescription] = useState('')
  const [editingItem, setEditingItem] = useState<ProfileDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = () => {
    setLoading(true)
    profilesApi
      .list()
      .then(setList)
      .catch((e) => setError(getApiErrorMessage(e, t, t('common.errorSave'))))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditingItem(null)
    setDescription('')
    setModalOpen(true)
  }

  const openEdit = (p: ProfileDto) => {
    setEditingItem(p)
    setDescription(p.description ?? '')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setDescription('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (editingItem) {
        await profilesApi.update(editingItem.id, { description })
      } else {
        await profilesApi.create({ description })
      }
      closeModal()
      load()
    } catch (e) {
      setError(getApiErrorMessage(e, t, t('common.errorSave')))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (p: ProfileDto) => {
    if (!confirm(t('profiles.deleteConfirm', { name: p.description ?? '' }))) return
    setError('')
    try {
      await profilesApi.delete(p.id)
      load()
    } catch (e) {
      setError(getApiErrorMessage(e, t, t('common.errorDelete')))
    }
  }

  if (loading) return <p>{t('profiles.loading')}</p>

  return (
    <div>
      <PageHeader
        title={t('profiles.title')}
        actions={<Button variant="primary" onClick={openCreate}>{t('profiles.newProfile')}</Button>}
      />
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{error}</p>}

      {list.length === 0 ? (
        <Card><p style={{ margin: 0 }}>{t('profiles.noItems')}</p></Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'visible' }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>{t('common.description')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.description}</td>
                    <td>
                      <div className="table-actions">
                        <IconButton icon="edit" title={t('common.edit')} variant="secondary" onClick={() => openEdit(p)} />
                        <IconButton icon="delete" title={t('common.delete')} variant="danger" onClick={() => handleDelete(p)} />
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
        title={editingItem ? t('profiles.editProfile') : t('profiles.newProfile')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button type="submit" form="profile-form" variant="primary" disabled={submitting}>
              {submitting ? t('common.saving') : editingItem ? t('common.saveChanges') : t('profiles.createProfile')}
            </Button>
          </>
        }
      >
        <form id="profile-form" onSubmit={handleSubmit}>
          <FormField label={t('common.description')} required>
            <input
              type="text"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  )
}
