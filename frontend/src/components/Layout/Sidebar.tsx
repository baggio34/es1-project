import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Package, Truck, Users, ShieldCheck, Map, UserCog, Navigation } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export interface SidebarProps {
  counts?: {
    orders: number
    vehicles: number
    drivers: number
  }
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation()
  const path = location.pathname

  const { user } = useAuth();
  
  // As permissões foram ajustadas para minúsculas (formato que o backend retorna agora)
  const navItems = [
    {
      id: 'orders',
      path: '/orders',
      label: 'Gerenciar Pedidos',
      icon: <Package size={18} />,
      allowedRoles: ['admin', 'manager', 'clerk', 'operator'],
    },
    {
      id: 'vehicles',
      path: '/vehicles',
      label: 'Gerenciar Frota',
      icon: <Truck size={18} />,
      allowedRoles: ['admin', 'manager', 'operator'],
    },
    {
      id: 'drivers',
      path: '/drivers',
      label: 'Gerenciar Motoristas',
      icon: <Users size={18} />,
      allowedRoles: ['admin', 'manager', 'operator'],
    },
    {
      id: 'routes',
      path: '/routes',
      label: 'Gerenciar Rotas',
      icon: <Map size={18} /> ,
      allowedRoles: ['admin', 'manager', 'operator'],
    },
    {
      id: 'driver-routes',
      path: '/driver-routes',
      label: 'Minhas Rotas (Motorista)',
      icon: <Navigation size={18} />,
      // Restrito exclusivamente para motoristas
      allowedRoles: ['driver'],
    },
    {
      id: 'users',
      path: '/users',
      label: 'Gerenciar Usuários',
      icon: <UserCog size={18} />,
      allowedRoles: ['admin', 'manager'],
    },
  ];

  // Garante que a role do usuário seja lida em minúscula antes de comparar
  const userRole = user?.role ? user.role.toLowerCase() : '';

  // Filter items based on the current user's role
  const filteredNavItems = navItems.filter(item =>
    item.allowedRoles.includes(userRole)
  );

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
        {filteredNavItems.map((item) => {
          const isActive = path.startsWith(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="sidebar-nav-left">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>
          );
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