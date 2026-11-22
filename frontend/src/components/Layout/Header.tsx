import React from 'react'
import { ChevronRight, User, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export interface HeaderProps {
  domainTitle: string
  pageTitle?: string
}

const roleNames: Record<string, string> = {
  Admin: 'Administrador',
  Manager: 'Gerente de Logística',
  Clerk: 'Atendente',
  Driver: 'Motorista',
}

export const Header: React.FC<HeaderProps> = ({ domainTitle, pageTitle }) => {
  const { user, logout } = useAuth()

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

      <div className="header-user">
        <div className="user-info" style={{ textAlign: 'right' }}>
          <span className="user-name">{user?.name || 'Usuário'}</span>
          <span className="user-role">{user ? (roleNames[user.role] || user.role) : 'Visitante'}</span>
        </div>
        <div className="user-avatar" title={user?.name || 'Usuário'}>
          <User size={18} />
        </div>
        {logout && (
          <button
            onClick={logout}
            title="Sair do sistema"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
              borderRadius: '0.375rem',
              color: 'var(--color-text-secondary)',
              transition: 'background-color 0.2s, color 0.2s',
              marginLeft: '0.25rem',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2'
              e.currentTarget.style.color = '#dc2626'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  )
}
