import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { catalogsApi, CompanyDto, CompanyCreateDto } from '../api/catalogs'
import { usersApi, UserDto } from '../api/users'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import IconButton from '../components/IconButton'
import FormField from '../components/FormField'
import Modal from '../components/Modal'

const COMPANY_ADMIN_PROFILE_ID = 3
const REQUESTER_PROFILE_ID = 2

export default function CompanyList() {
  const { t } = useTranslation()
  const [list, setList] = useState<CompanyDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CompanyCreateDto>({ name: '', description: '', companyType: 'COMPANY' })
  const [editingItem, setEditingItem] = useState<CompanyDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [companyApprovers, setCompanyApprovers] = useState<CompanyDto | null>(null)
  const [companyUsers, setCompanyUsers] = useState<UserDto[]>([])
  const [approversLoading, setApproversLoading] = useState(false)
  const [approverActionLoading, setApproverActionLoading] = useState<number | null>(null)

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

  const openApprovers = (c: CompanyDto) => {
    setCompanyApprovers(c)
    setCompanyUsers([])
    setApproversLoading(true)
    setError('')
    usersApi
      .list(c.id)
      .then(setCompanyUsers)
      .catch((err) => setError(getApiErrorMessage(err, t, t('common.errorSave'))))
      .finally(() => setApproversLoading(false))
  }

  const closeApproversModal = () => {
    setCompanyApprovers(null)
    setCompanyUsers([])
    setApproverActionLoading(null)
  }

  const addApprover = async (user: UserDto) => {
    setApproverActionLoading(user.id)
    setError('')
    try {
      await usersApi.update(user.id, { profileId: COMPANY_ADMIN_PROFILE_ID })
      setCompanyUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, profileId: COMPANY_ADMIN_PROFILE_ID } : u))
      )
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorSave')))
    } finally {
      setApproverActionLoading(null)
    }
  }

  const removeApprover = async (user: UserDto) => {
    setApproverActionLoading(user.id)
    setError('')
    try {
      await usersApi.update(user.id, { profileId: REQUESTER_PROFILE_ID })
      setCompanyUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, profileId: REQUESTER_PROFILE_ID } : u))
      )
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorSave')))
    } finally {
      setApproverActionLoading(null)
    }
  }

  const approversList = companyUsers.filter((u) => u.profileId === COMPANY_ADMIN_PROFILE_ID)
  const nonApproversList = companyUsers.filter((u) => u.profileId !== COMPANY_ADMIN_PROFILE_ID)

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
                        <IconButton icon="userPlus" title={t('companies.approvers')} variant="secondary" onClick={() => openApprovers(c)} data-testid={`company-approvers-${c.id}`} />
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

      <Modal
        open={companyApprovers != null}
        onClose={closeApproversModal}
        title={companyApprovers ? t('companies.approversTitle', { name: companyApprovers.name }) : ''}
        footer={
          <Button type="button" variant="ghost" onClick={closeApproversModal} data-testid="approvers-modal-close">
            {t('common.close')}
          </Button>
        }
      >
        {approversLoading ? (
          <p>{t('common.loading')}</p>
        ) : (
          <>
            <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: 'var(--spacing-md)' }}>{t('companies.approversList')}</h3>
            {approversList.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>{t('companies.noApprovers')}</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--spacing-lg)' }}>
                {approversList.map((u) => (
                  <li key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--color-border, #eee)' }}>
                    <span>{u.username}</span>
                    <Button
                      variant="ghost"
                      disabled={approverActionLoading === u.id}
                      onClick={() => removeApprover(u)}
                      data-testid={`remove-approver-${u.id}`}
                    >
                      {t('companies.removeApprover')}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>{t('companies.addApproverSection')}</h3>
            {nonApproversList.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>{t('companies.noUsersToAdd')}</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {nonApproversList.map((u) => (
                  <li key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--color-border, #eee)' }}>
                    <span>{u.username}</span>
                    <Button
                      variant="secondary"
                      disabled={approverActionLoading === u.id}
                      onClick={() => addApprover(u)}
                      data-testid={`add-approver-${u.id}`}
                    >
                      {t('companies.addApprover')}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
