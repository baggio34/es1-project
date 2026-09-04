import React from 'react'
import { Sidebar, type DomainType } from './Sidebar.tsx'
import { Header } from './Header.tsx'

export interface AppLayoutProps {
  currentDomain: DomainType
  onSelectDomain: (domain: DomainType) => void
  domainTitle: string
  pageTitle?: string
  children: React.ReactNode
  counts?: {
    orders: number
    vehicles: number
    drivers: number
  }
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentDomain,
  onSelectDomain,
  domainTitle,
  pageTitle,
  children,
  counts,
}) => {
  return (
    <div className="app-container">
      <Sidebar
        currentDomain={currentDomain}
        onSelectDomain={onSelectDomain}
        counts={counts}
      />
      <div className="app-main">
        <Header domainTitle={domainTitle} pageTitle={pageTitle} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
