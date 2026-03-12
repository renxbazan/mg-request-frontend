import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { catalogsApi, CompanyDto, CompanyCreateDto, RequestApproverDto, SiteDto } from '../api/catalogs'
import { usersApi, UserDto } from '../api/users'
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
  const [companyApprovers, setCompanyApprovers] = useState<CompanyDto | null>(null)
  const [companyUsers, setCompanyUsers] = useState<UserDto[]>([])
  const [approversList, setApproversList] = useState<RequestApproverDto[]>([])
  const [companySites, setCompanySites] = useState<SiteDto[]>([])
  const [approversLoading, setApproversLoading] = useState(false)
  const [approverActionLoading, setApproverActionLoading] = useState<string | null>(null)
  const [selectedAddCompanyUserId, setSelectedAddCompanyUserId] = useState<string>('')
  const [selectedAddBySite, setSelectedAddBySite] = useState<Record<number, string>>({})

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
    setApproversList([])
    setCompanySites([])
    setApproversLoading(true)
    setError('')
    Promise.all([
      usersApi.list(c.id),
      catalogsApi.listApprovers(c.id),
      catalogsApi.sites(c.id),
    ])
      .then(([users, approvers, sites]) => {
        setCompanyUsers(users)
        setApproversList(approvers)
        setCompanySites(sites)
      })
      .catch((err) => setError(getApiErrorMessage(err, t, t('common.errorSave'))))
      .finally(() => setApproversLoading(false))
  }

  const closeApproversModal = () => {
    setCompanyApprovers(null)
    setCompanyUsers([])
    setApproversList([])
    setCompanySites([])
    setApproverActionLoading(null)
    setSelectedAddCompanyUserId('')
    setSelectedAddBySite({})
  }

  const refreshApprovers = () => {
    if (!companyApprovers) return
    catalogsApi.listApprovers(companyApprovers.id).then(setApproversList)
  }

  const addApproverCompany = async (user: UserDto) => {
    if (!companyApprovers) return
    const key = `company-${user.id}`
    setApproverActionLoading(key)
    setError('')
    try {
      await catalogsApi.addApprover(companyApprovers.id, { userId: user.id, scope: 'COMPANY' })
      refreshApprovers()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorSave')))
    } finally {
      setApproverActionLoading(null)
    }
  }

  const addApproverSite = async (user: UserDto, siteId: number) => {
    if (!companyApprovers) return
    const key = `site-${siteId}-${user.id}`
    setApproverActionLoading(key)
    setError('')
    try {
      await catalogsApi.addApprover(companyApprovers.id, { userId: user.id, scope: 'SITE', siteId })
      refreshApprovers()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorSave')))
    } finally {
      setApproverActionLoading(null)
    }
  }

  const removeApproverCompany = async (a: RequestApproverDto) => {
    if (!companyApprovers) return
    const key = `rm-company-${a.userId}`
    setApproverActionLoading(key)
    setError('')
    try {
      await catalogsApi.removeApprover(companyApprovers.id, a.userId, { companyLevel: true })
      refreshApprovers()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorSave')))
    } finally {
      setApproverActionLoading(null)
    }
  }

  const removeApproverSite = async (a: RequestApproverDto) => {
    if (!companyApprovers || a.siteId == null) return
    const key = `rm-site-${a.siteId}-${a.userId}`
    setApproverActionLoading(key)
    setError('')
    try {
      await catalogsApi.removeApprover(companyApprovers.id, a.userId, { siteId: a.siteId })
      refreshApprovers()
    } catch (err) {
      setError(getApiErrorMessage(err, t, t('common.errorSave')))
    } finally {
      setApproverActionLoading(null)
    }
  }

  const companyLevelApprovers = approversList.filter((a) => a.scope === 'COMPANY')
  const siteLevelApproversBySite = companySites.map((site) => ({
    site,
    approvers: approversList.filter((a) => a.scope === 'SITE' && a.siteId === site.id),
  }))
  const companyLevelUserIds = new Set(companyLevelApprovers.map((a) => a.userId))
  const usersAvailableForCompany = companyUsers.filter((u) => !companyLevelUserIds.has(u.id))

  const handleAddCompanyApprover = () => {
    const id = selectedAddCompanyUserId ? Number(selectedAddCompanyUserId) : 0
    const user = companyUsers.find((u) => u.id === id)
    if (user && companyApprovers) {
      addApproverCompany(user)
      setSelectedAddCompanyUserId('')
    }
  }

  const handleAddSiteApprover = (siteId: number) => {
    const id = selectedAddBySite[siteId] ? Number(selectedAddBySite[siteId]) : 0
    const user = companyUsers.find((u) => u.id === id)
    if (user && companyApprovers) {
      addApproverSite(user, siteId)
      setSelectedAddBySite((prev) => ({ ...prev, [siteId]: '' }))
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
        maxWidth={560}
        footer={
          <Button type="button" variant="ghost" onClick={closeApproversModal} data-testid="approvers-modal-close">
            {t('common.close')}
          </Button>
        }
      >
        {approversLoading ? (
          <p>{t('common.loading')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* Sección: Aprobadores de toda la empresa */}
            <section style={{ paddingBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border, #eee)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 var(--spacing-md)', color: 'var(--color-text)' }}>
                {t('companies.approversCompanyLevel')}
              </h3>
              {companyLevelApprovers.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)' }}>{t('companies.noApprovers')}</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--spacing-md)' }}>
                  {companyLevelApprovers.map((a) => (
                    <li
                      key={`company-${a.userId}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--spacing-sm) 0',
                        borderBottom: '1px solid var(--color-border, #eee)',
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{a.userName}</span>
                      <IconButton
                        icon="delete"
                        title={t('companies.removeApprover')}
                        variant="ghost"
                        disabled={approverActionLoading === `rm-company-${a.userId}`}
                        onClick={() => removeApproverCompany(a)}
                        data-testid={`remove-approver-${a.userId}`}
                      />
                    </li>
                  ))}
                </ul>
              )}
              <div style={{ display: 'flex', gap: 'var(--spacing)', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="input"
                  value={selectedAddCompanyUserId}
                  onChange={(e) => setSelectedAddCompanyUserId(e.target.value)}
                  style={{ flex: '1 1 140px', minWidth: 0 }}
                  data-testid="approvers-add-company-select"
                >
                  <option value="">{t('companies.selectUserToAdd')}</option>
                  {usersAvailableForCompany.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  disabled={!selectedAddCompanyUserId || approverActionLoading !== null}
                  onClick={handleAddCompanyApprover}
                  data-testid="add-approver-company-btn"
                >
                  {t('companies.addApprover')}
                </Button>
              </div>
              {usersAvailableForCompany.length === 0 && companyLevelApprovers.length > 0 && (
                <p style={{ margin: 'var(--spacing) 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {t('companies.noUsersToAdd')}
                </p>
              )}
            </section>

            {/* Sección: Por sitio */}
            <section>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 var(--spacing-md)', color: 'var(--color-text)' }}>
                {t('companies.approversBySite')}
              </h3>
              {companySites.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)' }}>{t('companies.noSites')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  {siteLevelApproversBySite.map(({ site, approvers }) => {
                    const usersAvailableForSite = companyUsers.filter((u) => !approvers.some((a) => a.userId === u.id))
                    return (
                      <div
                        key={site.id}
                        style={{
                          padding: 'var(--spacing-md)',
                          background: 'var(--color-bg)',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--color-border, #eee)',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 'var(--spacing)', color: 'var(--color-primary)' }}>
                          {site.name}
                        </div>
                        {approvers.length === 0 ? (
                          <p style={{ margin: '0 0 var(--spacing)', fontSize: 13, color: 'var(--color-text-muted)' }}>{t('companies.noApprovers')}</p>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--spacing)' }}>
                            {approvers.map((a) => (
                              <li
                                key={`site-${site.id}-${a.userId}`}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0' }}
                              >
                                <span style={{ fontSize: 14 }}>{a.userName}</span>
                                <IconButton
                                  icon="delete"
                                  title={t('common.delete')}
                                  variant="ghost"
                                  disabled={approverActionLoading === `rm-site-${site.id}-${a.userId}`}
                                  onClick={() => removeApproverSite(a)}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                        <div style={{ display: 'flex', gap: 'var(--spacing)', alignItems: 'center', flexWrap: 'wrap' }}>
                          <select
                            className="input"
                            value={selectedAddBySite[site.id] ?? ''}
                            onChange={(e) => setSelectedAddBySite((prev) => ({ ...prev, [site.id]: e.target.value }))}
                            style={{ flex: '1 1 120px', minWidth: 0 }}
                          >
                            <option value="">{t('companies.selectUserToAdd')}</option>
                            {usersAvailableForSite.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.username}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="secondary"
                            disabled={!selectedAddBySite[site.id] || approverActionLoading !== null}
                            onClick={() => handleAddSiteApprover(site.id)}
                          >
                            {t('companies.addApprover')}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </Modal>
    </div>
  )
}
