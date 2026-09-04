import React from 'react'
import { Package, Truck, Users, ShieldCheck } from 'lucide-react'

export type DomainType = 'orders' | 'vehicles' | 'drivers'

export interface SidebarProps {
  currentDomain: DomainType
  onSelectDomain: (domain: DomainType) => void
  counts?: {
    orders: number
    vehicles: number
    drivers: number
  }
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentDomain,
  onSelectDomain,
}) => {
  const navItems = [
    {
      id: 'orders' as DomainType,
      label: 'Gerenciar Pedidos',
      icon: <Package size={18} />,
    },
    {
      id: 'vehicles' as DomainType,
      label: 'Gerenciar Frota',
      icon: <Truck size={18} />,
    },
    {
      id: 'drivers' as DomainType,
      label: 'Gerenciar Motoristas',
      icon: <Users size={18} />,
    },
  ]

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-header">
        <div className="app-brand-icon">
          <Truck size={20} />
        </div>
        <div>
          <div className="app-brand-title">Gestão de Transportes</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = currentDomain === item.id
          return (
            <div
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectDomain(item.id)}
            >
              <div className="sidebar-nav-left">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          <ShieldCheck size={16} color="var(--color-primary)" />
          <span>Sistema Operacional Corporativo</span>
        </div>
      </div>
    </aside>
  )
}
