import React from 'react'
import { ChevronRight, User, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export interface HeaderProps {
  domainTitle: string
  pageTitle?: string
}

const roleNames: Record<string, string> = {
  admin: 'Administrador',
  Admin: 'Administrador',
  manager: 'Gerente de Logística',
  Manager: 'Gerente de Logística',
  operator: 'Operador de Logística',
  Operator: 'Operador de Logística',
  clerk: 'Atendente',
  Clerk: 'Atendente',
  driver: 'Motorista',
  Driver: 'Motorista',
}

export const Header: React.FC<HeaderProps> = ({ domainTitle, pageTitle }) => {
  const { user, logout } = useAuth()

  const formattedRole = user?.role ? (roleNames[user.role] || user.role) : 'Visitante'

  return (
    <header className="app-header">
      <div className="header-breadcrumbs">
        <span>Sistema</span>
        <ChevronRight size={14} className="header-breadcrumbs-separator" />
        <span className={pageTitle ? '' : 'header-breadcrumbs-current'}>{domainTitle}</span>
        {pageTitle && (
          <>
            <ChevronRight size={14} className="header-breadcrumbs-separator" />
            <span className="header-breadcrumbs-current">{pageTitle}</span>
          </>
        )}
      </div>

      <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="user-info" style={{ textAlign: 'right' }}>
          <span className="user-name">{user?.name || 'Utilizador'}</span>
          <span className="user-role">{formattedRole}</span>
        </div>
        <div className="user-avatar" title={user?.name}>
          <User size={18} />
        </div>
        
        {/* Botão de Sair adicionado para facilitar os testes com outros cargos */}
        <button 
          onClick={logout}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-text-secondary)',
            padding: '0.5rem',
            marginLeft: '0.5rem'
          }}
          title="Sair do Sistema"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}