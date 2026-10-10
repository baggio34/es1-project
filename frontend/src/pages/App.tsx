import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppLayout } from '../components/Layout/AppLayout.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { ProtectedRoute } from '../components/Auth/ProtectedRoute.tsx'

// Models
import type { DriverFormData } from '../models/driver.ts'
import type { VehicleFormData } from '../models/vehicle.ts'
import type { OrderFormData } from '../models/order.ts'

// Custom Hooks
import { useDriver } from '../view_models/useDriver.ts'
import { useVehicle } from '../view_models/useVehicle.ts'
import { useOrder } from '../view_models/useOrder.ts'

// Mock Data
import { mockDrivers, mockVehicles, mockOrders, mockRoutes, mockUsers } from '../utils/mockData.ts'

// Pages
import { DriverListPage } from './Drivers/DriverListPage.tsx'
import { DriverDetailPage } from './Drivers/DriverDetailPage.tsx'
import { DriverFormPage } from './Drivers/DriverFormPage.tsx'

import { VehicleListPage } from './Vehicles/VehicleListPage.tsx'
import { VehicleDetailPage } from './Vehicles/VehicleDetailPage.tsx'
import { VehicleFormPage } from './Vehicles/VehicleFormPage.tsx'

import { OrderListPage } from './Orders/OrderListPage.tsx'
import { OrderDetailPage } from './Orders/OrderDetailPage.tsx'
import { OrderFormPage } from './Orders/OrderFormPage.tsx'

import { RouteListPage } from './Routes/RouteListPage.tsx'
import { RouteDetailPage } from './Routes/RouteDetailPage.tsx'

import { DriverRoutesPage } from './Drivers/DriverRoutesPage.tsx'

import { UserListPage } from './Users/UserListPage.tsx'
import { UserDetailPage } from './Users/UserDetailPage.tsx'
import { UserFormPage } from './Users/UserFormPage.tsx'

import { LoginPage } from './Login/LoginPage.tsx'

export default function App() {
  const { user } = useAuth()
  // Using local state to mock backend for interactive development
  const [drivers, setDrivers] = useState(mockDrivers)
  const [vehicles, setVehicles] = useState(mockVehicles)
  const [orders, setOrders] = useState(mockOrders)
  const [routes, setRoutes] = useState(mockRoutes)
  const [users, setUsers] = useState(mockUsers)

  // Mock functions
  const deleteOrder = async (id: string) => setOrders(prev => prev.filter(o => o.id !== id))
  const deleteVehicle = async (id: string) => setVehicles(prev => prev.filter(v => v.id !== id))
  const deleteDriver = async (id: string) => setDrivers(prev => prev.filter(d => d.id !== id))
  
  const saveOrder = async (data: any, id?: string) => {
    if (id) setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o))
    else setOrders(prev => [...prev, { id: 'O-' + Date.now(), registeredOn: new Date().toISOString(), ...data }])
  }
  const saveVehicle = async (data: any, id?: string) => {
    if (id) setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } : v))
    else setVehicles(prev => [...prev, { id: 'V-' + Date.now(), status: 'free', ...data }])
  }
  const saveDriver = async (data: any, id?: string) => {
    if (id) setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...data } : d))
    else setDrivers(prev => [...prev, { id: 'D-' + Date.now(), status: 'free', ...data }])
  }

  const navigate = useNavigate()

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout counts={{ orders: orders.length, vehicles: vehicles.length, drivers: drivers.length }} />}>
        {/* Redirecionamento da raiz de acordo com a permissão */}
        <Route index element={<Navigate to={user.role === 'Driver' ? '/driver-routes' : '/orders'} replace />} />

        {/* DOMÍNIO: PEDIDOS (Admins, Managers, Clerks) */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Clerk']} />}>
          <Route path="orders">
            <Route index element={<OrderListPage orders={orders} onViewDetails={(id) => navigate(`/orders/${id}`)} onEdit={(id) => navigate(`/orders/${id}/edit`)} onCreate={() => navigate('/orders/create')} onDelete={deleteOrder} onReload={() => {}} />} />
            <Route path="create" element={<OrderFormPage onSave={async (data) => { await saveOrder(data); navigate('/orders'); }} onCancel={() => navigate('/orders')} />} />
            <Route path=":id" element={<OrderDetailWrapper orders={orders} />} />
            <Route path=":id/edit" element={<OrderFormWrapper orders={orders} onSave={saveOrder} />} />
          </Route>

          {/* DOMÍNIO: VEÍCULOS */}
          <Route path="vehicles">
            <Route index element={<VehicleListPage vehicles={vehicles} onViewDetails={(id) => navigate(`/vehicles/${id}`)} onEdit={(id) => navigate(`/vehicles/${id}/edit`)} onCreate={() => navigate('/vehicles/create')} onDelete={deleteVehicle} onReload={() => {}} />} />
            <Route path="create" element={<VehicleFormPage onSave={async (data) => { await saveVehicle(data); navigate('/vehicles'); }} onCancel={() => navigate('/vehicles')} />} />
            <Route path=":id" element={<VehicleDetailWrapper vehicles={vehicles} />} />
            <Route path=":id/edit" element={<VehicleFormWrapper vehicles={vehicles} onSave={saveVehicle} />} />
          </Route>

          {/* DOMÍNIO: MOTORISTAS */}
          <Route path="drivers">
            <Route index element={<DriverListPage drivers={drivers} onViewDetails={(id) => navigate(`/drivers/${id}`)} onEdit={(id) => navigate(`/drivers/${id}/edit`)} onCreate={() => navigate('/drivers/create')} onDelete={deleteDriver} onReload={() => {}} />} />
            <Route path="create" element={<DriverFormPage onSave={async (data) => { await saveDriver(data); navigate('/drivers'); }} onCancel={() => navigate('/drivers')} />} />
            <Route path=":id" element={<DriverDetailWrapper drivers={drivers} />} />
            <Route path=":id/edit" element={<DriverFormWrapper drivers={drivers} onSave={saveDriver} />} />
          </Route>
        </Route>

        {/* DOMÍNIO: ROTAS (Admins, Managers) */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} />}>
          <Route path="routes">
            <Route index element={<RouteListPage routes={routes} drivers={drivers} vehicles={vehicles} onReload={() => {}} onViewDetails={(id) => navigate(`/routes/${id}`)} onAuthorizeDispatch={(id) => {}} onUnauthorizeDispatch={(id) => {}} />} />
            <Route path=":id" element={<RouteDetailWrapper routes={routes} orders={orders} />} />
          </Route>

          {/* DOMÍNIO: USUÁRIOS */}
          <Route path="users">
            <Route index element={<UserListPage users={users} onReload={() => {}} onCreate={() => navigate('/users/create')} onEdit={(id) => navigate(`/users/${id}/edit`)} onViewDetails={(id) => navigate(`/users/${id}`)} />} />
            <Route path="create" element={<UserFormPage onSave={(data) => { setUsers(prev => [...prev, { id: 'U-' + Date.now(), condition: 'active', ...data } as any]); navigate('/users') }} onCancel={() => navigate('/users')} />} />
            <Route path=":id" element={<UserDetailWrapper users={users} />} />
            <Route path=":id/edit" element={<UserFormWrapper users={users} onSave={async (data, id) => { setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u)) }} />} />
          </Route>
        </Route>

        {/* DOMÍNIO: ROTAS DO MOTORISTA (Admins, Managers, Drivers) */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Driver']} />}>
          <Route path="driver-routes" element={<DriverRoutesPage pastRoutes={routes.filter(r => r.status === 'completed')} onViewOrderDetails={(id) => navigate(`/orders/${id}`)} onViewRouteDetails={(id) => navigate(`/routes/${id}`)} />} />
        </Route>
      </Route>
      
      {/* Fallback de rotas não encontradas */}
      <Route path="*" element={<Navigate to={user?.role === 'Driver' ? '/driver-routes' : '/orders'} replace />} />
    </Routes>
  )
}

// --- Componentes Wrappers para extrair :id dos parâmetros da URL ---

function OrderDetailWrapper({ orders }: { orders: any[] }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = orders.find(o => o.id === id)
  if (!order) return <div>Pedido não encontrado.</div>
  return <OrderDetailPage order={order} onBack={() => navigate('/orders')} onEdit={() => navigate(`/orders/${id}/edit`)} />
}

function OrderFormWrapper({ orders, onSave }: { orders: any[], onSave: (data: any, id: string) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = orders.find(o => o.id === id)
  if (!order) return <div>Pedido não encontrado para edição.</div>
  return <OrderFormPage initialOrder={order} onSave={async (data) => { await onSave(data, id as string); navigate('/orders'); }} onCancel={() => navigate('/orders')} />
}

function VehicleDetailWrapper({ vehicles }: { vehicles: any[] }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const vehicle = vehicles.find(v => v.id === id)
  if (!vehicle) return <div>Veículo não encontrado.</div>
  return <VehicleDetailPage vehicle={vehicle} onBack={() => navigate('/vehicles')} onEdit={() => navigate(`/vehicles/${id}/edit`)} onViewRoute={(routeId) => navigate(`/routes/${routeId}`)} />
}

function VehicleFormWrapper({ vehicles, onSave }: { vehicles: any[], onSave: (data: any, id: string) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const vehicle = vehicles.find(v => v.id === id)
  if (!vehicle) return <div>Veículo não encontrado para edição.</div>
  return <VehicleFormPage initialVehicle={vehicle} onSave={async (data) => { await onSave(data, id as string); navigate('/vehicles'); }} onCancel={() => navigate('/vehicles')} />
}

function DriverDetailWrapper({ drivers }: { drivers: any[] }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const driver = drivers.find(d => d.id === id)
  if (!driver) return <div>Motorista não encontrado.</div>
  return <DriverDetailPage driver={driver} onBack={() => navigate('/drivers')} onEdit={() => navigate(`/drivers/${id}/edit`)} onViewRoute={(routeId) => navigate(`/routes/${routeId}`)} />
}

function DriverFormWrapper({ drivers, onSave }: { drivers: any[], onSave: (data: any, id: string) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const driver = drivers.find(d => d.id === id)
  if (!driver) return <div>Motorista não encontrado para edição.</div>
  return <DriverFormPage initialDriver={driver} onSave={async (data) => { await onSave(data, id as string); navigate('/drivers'); }} onCancel={() => navigate('/drivers')} />
}

function RouteDetailWrapper({ routes, orders }: { routes: any[], orders: any[] }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const route = routes.find(r => r.id === id)
  if (!route) return <div>Rota não encontrada.</div>
  const routeOrders = orders.filter(o => route.orderIds?.includes(o.id))
  return <RouteDetailPage route={route} orders={routeOrders} onBack={() => navigate('/routes')} onViewOrder={(id) => navigate(`/orders/${id}`)} onViewDriver={(id) => navigate(`/drivers/${id}`)} onViewVehicle={(id) => navigate(`/vehicles/${id}`)} />
}

function UserDetailWrapper({ users }: { users: any[] }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = users.find(u => u.id === id || u.username === id) // Supports both ID or Username
  if (!user) return <div>Usuário não encontrado.</div>
  return <UserDetailPage user={user} driverStatus={user.role === 'Driver' ? 'free' : undefined} onBack={() => navigate('/users')} onEdit={(id) => navigate(`/users/${id}/edit`)} onViewRoute={(id) => navigate(`/routes/${id}`)} />
}

function UserFormWrapper({ users, onSave }: { users: any[], onSave: (data: any, id: string) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = users.find(u => u.id === id)
  if (!user) return <div>Usuário não encontrado para edição.</div>
  return <UserFormPage initialUser={user} onSave={async (data) => { await onSave(data, id as string); navigate('/users'); }} onCancel={() => navigate('/users')} />
}