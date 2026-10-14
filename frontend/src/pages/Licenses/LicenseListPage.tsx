import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button.tsx'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Plus, Search, Pencil, Trash2, RefreshCw, Award, AlertCircle } from 'lucide-react'
import { useLicense } from '../../view_models/useLicense.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
import type { License } from '../../models/license.ts'

export const LicenseListPage: React.FC = () => {
  const { user } = useAuth()
  const canManage = user?.role === 'admin' || user?.role === 'manager'

  const { licenses, loading, error, loadLicenses, createLicense, updateLicense, deleteLicense } = useLicense()

  const [searchTerm, setSearchTerm] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newLicenseName, setNewLicenseName] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingLicense, setEditingLicense] = useState<License | null>(null)
  const [editLicenseName, setEditLicenseName] = useState('')
  const [editError, setEditError] = useState<string | null>(null)

  const [licenseToDelete, setLicenseToDelete] = useState<License | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadLicenses().catch(console.error)
  }, [loadLicenses])

  const slugify = (text: string) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
  }

  const filteredLicenses = licenses.filter((l) => {
    const term = searchTerm.toLowerCase()
    return l.name.toLowerCase().includes(term) || l.slug.toLowerCase().includes(term)
  })

  const handleOpenCreate = () => {
    setNewLicenseName('')
    setCreateError(null)
    setCreateModalOpen(true)
  }

  const handleCreate = async () => {
    const trimmed = newLicenseName.trim()
    if (!trimmed) {
      setCreateError('O nome da licença é obrigatório.')
      return
    }
    const slug = slugify(trimmed)
    if (licenses.some((l) => l.slug === slug)) {
      setCreateError('Já existe uma licença cadastrada com este nome ou identificador.')
      return
    }

    try {
      setIsSubmitting(true)
      setCreateError(null)
      await createLicense({ name: trimmed })
      setCreateModalOpen(false)
      setNewLicenseName('')
    } catch (err: any) {
      setCreateError(err.message || 'Falha ao cadastrar licença.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenEdit = (lic: License) => {
    setEditingLicense(lic)
    setEditLicenseName(lic.name)
    setEditError(null)
    setEditModalOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingLicense) return
    const trimmed = editLicenseName.trim()
    if (!trimmed) {
      setEditError('O nome da licença não pode estar vazio.')
      return
    }
    const newSlug = slugify(trimmed)
    if (newSlug !== editingLicense.slug && licenses.some((l) => l.slug === newSlug)) {
      setEditError('Já existe outra licença cadastrada com este nome.')
      return
    }

    try {
      setIsSubmitting(true)
      setEditError(null)
      await updateLicense(editingLicense.slug, { name: trimmed })
      setEditModalOpen(false)
      setEditingLicense(null)
    } catch (err: any) {
      setEditError(err.message || 'Falha ao atualizar licença.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!licenseToDelete) return
    try {
      setIsSubmitting(true)
      await deleteLicense(licenseToDelete.slug)
      setLicenseToDelete(null)
    } catch (err: any) {
      alert(`Erro ao excluir licença: ${err.message || 'Erro desconhecido.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gerenciamento de Licenças</h1>
          <p className="page-description">
            Cadastre, edite e controle as licenças regulatórias necessárias para veículos, motoristas e tipos específicos de carga.
          </p>
        </div>
        <div className="page-actions">
          <Button variant="outline" icon={<RefreshCw size={16} />} onClick={() => loadLicenses()} disabled={loading}>
            Recarregar
          </Button>
          {canManage && (
            <Button icon={<Plus size={16} />} onClick={handleOpenCreate}>
              Nova Licença
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-danger-text)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="filters-bar">
        <div className="search-input-wrapper" style={{ maxWidth: '420px', width: '100%' }}>
          <Search size={16} />
          <Input
            className="pl-10"
            placeholder="Buscar por nome da licença ou slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Nome da Licença</TableHead>
            <TableHead className="min-w-[180px]">Identificador Único (Slug)</TableHead>
            <TableHead className="w-[140px]" style={{ textAlign: 'right' }}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && licenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} style={{ textAlign: 'center', padding: '2.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Carregando licenças regulatórias...</span>
              </TableCell>
            </TableRow>
          ) : filteredLicenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} style={{ textAlign: 'center', padding: '2.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {searchTerm ? 'Nenhuma licença encontrada para a busca informada.' : 'Nenhuma licença regulatória cadastrada no sistema.'}
                </span>
              </TableCell>
            </TableRow>
          ) : (
            filteredLicenses.map((lic) => (
              <TableRow key={lic.slug}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(30, 64, 175, 0.1)',
                      color: 'var(--color-primary)'
                    }}>
                      <Award size={16} />
                    </div>
                    <span>{lic.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code style={{
                    backgroundColor: 'var(--color-bg-subtle)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'monospace'
                  }}>
                    {lic.slug}
                  </code>
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Pencil size={15} />}
                          onClick={() => handleOpenEdit(lic)}
                          title="Editar Licença"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: 'var(--color-danger-button)' }}
                          icon={<Trash2 size={15} />}
                          onClick={() => setLicenseToDelete(lic)}
                          title="Excluir Licença"
                        />
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal de Cadastro */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Cadastrar Nova Licença"
        description="Defina uma nova licença operacional para vinculação com veículos, motoristas ou pedidos."
        confirmText={isSubmitting ? 'Cadastrando...' : 'Cadastrar Licença'}
        onConfirm={handleCreate}
      >
        <div className="ui-form-group">
          <label className="ui-label">Nome da Licença *</label>
          <Input
            placeholder="Ex: Transporte de Carga Perigosa (MOPP)"
            value={newLicenseName}
            onChange={(e) => {
              setNewLicenseName(e.target.value)
              setCreateError(null)
            }}
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        {newLicenseName.trim() && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            <span>Slug que será gerado: </span>
            <code style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{slugify(newLicenseName)}</code>
          </div>
        )}

        {createError && (
          <div style={{
            marginTop: '1rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-danger-text)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={14} />
            <span>{createError}</span>
          </div>
        )}
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Licença"
        description="Atualize o nome da licença. As entidades vinculadas a esta licença terão seus registros atualizados automaticamente."
        confirmText={isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        onConfirm={handleUpdate}
      >
        <div className="ui-form-group">
          <label className="ui-label">Identificador Atual</label>
          <Input value={editingLicense?.slug || ''} disabled style={{ backgroundColor: 'var(--color-bg-subtle)' }} />
        </div>

        <div className="ui-form-group" style={{ marginTop: '1rem' }}>
          <label className="ui-label">Nome da Licença *</label>
          <Input
            value={editLicenseName}
            onChange={(e) => {
              setEditLicenseName(e.target.value)
              setEditError(null)
            }}
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        {editLicenseName.trim() && editingLicense && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            <span>Novo slug gerado: </span>
            <code style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{slugify(editLicenseName)}</code>
          </div>
        )}

        {editError && (
          <div style={{
            marginTop: '1rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-danger-text)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={14} />
            <span>{editError}</span>
          </div>
        )}
      </Modal>

      {/* Modal de Exclusão */}
      <Modal
        isOpen={!!licenseToDelete}
        onClose={() => setLicenseToDelete(null)}
        title="Excluir Licença"
        description={`Deseja realmente remover permanentemente a licença "${licenseToDelete?.name}" (${licenseToDelete?.slug}) do sistema? Esta ação é irreversível.`}
        confirmText={isSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}
        confirmVariant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
