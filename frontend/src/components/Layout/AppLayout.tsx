import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar.tsx'
import { Header } from './Header.tsx'

export interface AppLayoutProps {
  counts?: {
    orders: number
    vehicles: number
    drivers: number
  }
}

export const AppLayout: React.FC<AppLayoutProps> = ({ counts }) => {
  const location = useLocation()
  const path = location.pathname

  let domainTitle = 'Dashboard'
  let pageTitle: string | undefined = undefined

  if (path.startsWith('/orders')) domainTitle = 'Gerência de Pedidos'
  else if (path.startsWith('/vehicles')) domainTitle = 'Gerência de Frota'
  else if (path.startsWith('/drivers')) domainTitle = 'Gerência de Motoristas'
  else if (path.startsWith('/routes')) domainTitle = 'Gerência de Rotas'
  else if (path.startsWith('/driver-routes')) domainTitle = 'Painel do Motorista'
  else if (path.startsWith('/users')) domainTitle = 'Gerência de Usuários'

  if (path.endsWith('/create')) pageTitle = 'Novo Cadastro'
  else if (path.endsWith('/edit')) pageTitle = 'Edição de Cadastro'
  else if (path.split('/').length > 2) pageTitle = 'Visualização de Detalhes'

  return (
    <div className="app-container">
      <Sidebar counts={counts} />
      <div className="app-main">
        <Header domainTitle={domainTitle} pageTitle={pageTitle} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
