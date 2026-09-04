import React from 'react'
import { ChevronRight, User } from 'lucide-react'

export interface HeaderProps {
  domainTitle: string
  pageTitle?: string
}

export const Header: React.FC<HeaderProps> = ({ domainTitle, pageTitle }) => {
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
          <span className="user-name">Gabriel Varnier</span>
          <span className="user-role">Operador de Logística</span>
        </div>
        <div className="user-avatar" title="Gabriel Varnier">
          <User size={18} />
        </div>
      </div>
    </header>
  )
}
