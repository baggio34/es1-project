import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppLayout } from '../components/Layout/AppLayout.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { ProtectedRoute } from '../components/Auth/ProtectedRoute.tsx'
import { Button } from '../components/ui/button.tsx'

// Custom Hooks
import { useDriver } from '../view_models/useDriver.ts'
import { useVehicle } from '../view_models/useVehicle.ts'
import { useOrder } from '../view_models/useOrder.ts'
import { useRoute } from '../view_models/useRoute.ts'
import { useUser } from '../view_models/useUser.ts'

// Pages
import { DriverListPage } from './Drivers/DriverListPage.tsx'
import { DriverDetailPage } from './Drivers/DriverDetailPage.tsx'

import { VehicleListPage } from './Vehicles/VehicleListPage.tsx'
import { VehicleDetailPage } from './Vehicles/VehicleDetailPage.tsx'
import { VehicleFormPage } from './Vehicles/VehicleFormPage.tsx'

import { OrderListPage } from './Orders/OrderListPage.tsx'
import { OrderDetailPage } from './Orders/OrderDetailPage.tsx'
import { OrderFormPage } from './Orders/OrderFormPage.tsx'

import { RouteListPage } from './Routes/RouteListPage.tsx'
import { RouteDetailPage } from './Routes/RouteDetailPage.tsx'

import { DriverRoutesPage } from './Drivers/DriverRoutesPage.tsx'
import { LoginPage } from './Login/LoginPage.tsx'

import { UserListPage } from './Users/UserListPage.tsx'
import { UserDetailPage } from './Users/UserDetailPage.tsx'
import { UserFormPage } from './Users/UserFormPage.tsx'

// === BLINDAGEM DE ERROS (ERROR BOUNDARY) ===
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', backgroundColor: '#fee2e2', minHeight: '100vh', color: '#991b1b', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Erro Crítico no React</h1>
          <p>A tela branca foi evitada. O erro exato foi:</p>
          <pre style={{ background: '#fff', padding: '1rem', marginTop: '1rem', borderRadius: '8px', overflowX: 'auto', border: '1px solid #f87171' }}>
            {String(this.state.error)}
          </pre>
          <Button style={{ marginTop: '1rem' }} onClick={() => window.location.href = '/'}>
            Recarregar Página
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { loadDrivers } = useDriver()
  const { vehicles, loadVehicles, registerVehicle, api: vehicleApi } = useVehicle()
  const { orders, loadOrders, api: orderApi } = useOrder()
  
  const { routes, loadRoutes, api: routeApi } = useRoute()
  const { users, loadUsers, registerUser, api: userApi } = useUser()
  
  useEffect(() => {
    if (user) {
      loadDrivers().catch(console.error)
      loadVehicles().catch(console.error)
      loadOrders().catch(console.error)
      loadRoutes().catch(console.error)
      loadUsers().catch(console.error)
    }
  }, [user, loadDrivers, loadVehicles, loadOrders, loadRoutes, loadUsers])

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const safeOrders = Array.isArray(orders) ? orders : []
  const mappedOrders = safeOrders.map(o => o?.order || o).filter(Boolean)

  const safeRoutes = Array.isArray(routes) ? routes : []
  const mappedRoutes = safeRoutes.map(r => r?.route || r).filter(Boolean)
  
  const safeVehicles = Array.isArray(vehicles) ? vehicles : []
  
  const safeUsers = Array.isArray(users) ? users : []
  const allDrivers = safeUsers.filter(u => u.role === 'driver')

  const userRole = user?.role?.toLowerCase()

  // Extração da rota ativa e pedidos do motorista logado
  const activeDriverRoute = mappedRoutes.find(r => r.driverId === user?.username && r.status !== 'completed')
  const activeDriverOrders = activeDriverRoute ? mappedOrders.filter(o => activeDriverRoute.orders?.includes(o.id) || activeDriverRoute.orders?.includes(String(o.id))) : []
  const pastDriverRoutes = mappedRoutes.filter(r => r.driverId === user?.username && r.status === 'completed')

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />

        <Route path="/" element={<AppLayout counts={{ orders: mappedOrders.length, vehicles: safeVehicles.length, drivers: allDrivers.length }} />}>
          
          <Route index element={<Navigate to={userRole === 'driver' ? '/driver-routes' : '/orders'} replace />} />

          <Route element={<ProtectedRoute allowedRoles={['admin', 'Admin', 'manager', 'Manager', 'clerk', 'Clerk', 'operator', 'Operator']} />}>
            <Route path="orders">
              <Route index element={<OrderListPage orders={mappedOrders} onViewDetails={(id) => navigate(`/orders/${id}`)} onEdit={(id) => navigate(`/orders/${id}/edit`)} onCreate={() => navigate('/orders/create')} onDelete={async (id, reason) => { await orderApi.cancel(id, { reason }); loadOrders() }} onReload={loadOrders} />} />
              <Route path="create" element={<OrderFormPage onSave={async (data) => { await orderApi.create(data as any); loadOrders(); navigate('/orders'); }} onCancel={() => navigate('/orders')} />} />
              <Route path=":id" element={<OrderDetailWrapper orders={mappedOrders} orderApi={orderApi} loadOrders={loadOrders} loadRoutes={loadRoutes} loadDrivers={loadDrivers} loadVehicles={loadVehicles} />} />
              <Route path=":id/edit" element={<OrderFormWrapper orders={mappedOrders} onSave={async (data: any, id: string) => { await orderApi.patch(id, data); loadOrders() }} />} />
            </Route>

            <Route path="vehicles">
              <Route index element={<VehicleListPage vehicles={safeVehicles} routes={mappedRoutes} drivers={allDrivers} onViewDetails={(id) => navigate(`/vehicles/${id}`)} onEdit={(id) => navigate(`/vehicles/${id}/edit`)} onCreate={() => navigate('/vehicles/create')} onDelete={async () => {}} onReload={loadVehicles} />} />
              <Route path="create" element={<VehicleFormPage onSave={async (data) => { await registerVehicle(data); navigate('/vehicles'); }} onCancel={() => navigate('/vehicles')} />} />
              <Route path=":id" element={<VehicleDetailWrapper vehicles={safeVehicles} routes={mappedRoutes} drivers={allDrivers} />} />
              <Route path=":id/edit" element={<VehicleFormWrapper vehicles={safeVehicles} onSave={async (data: any, id: string) => { await vehicleApi.patch(id, data); loadVehicles() }} />} />
            </Route>

            <Route path="drivers">
              <Route index element={<DriverListPage drivers={allDrivers as any} routes={mappedRoutes} vehicles={safeVehicles} onViewDetails={(id) => navigate(`/drivers/${id}`)} onEdit={(id) => navigate(`/users/${id}/edit`)} onCreate={() => navigate('/users/create')} onDelete={async () => {}} onReload={loadUsers} />} />
              <Route path=":id" element={<DriverDetailWrapper drivers={allDrivers} routes={mappedRoutes} vehicles={safeVehicles} />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'Admin', 'manager', 'Manager', 'operator', 'Operator']} />}>
            <Route path="routes">
              <Route index element={
                <RouteListPage 
                  routes={mappedRoutes} 
                  drivers={allDrivers as any} 
                  vehicles={safeVehicles} 
                  onReload={loadRoutes} 
                  onViewDetails={(id) => navigate(`/routes/${id}`)} 
                  onAuthorizeDispatch={async (id) => {
                    await routeApi.authorizeDispatch(id)
                    await Promise.allSettled([loadRoutes(), loadVehicles(), loadDrivers(), loadOrders()])
                  }} 
                  onUnauthorizeDispatch={async (id) => {
                    await routeApi.unauthorizeDispatch(id)
                    await Promise.allSettled([loadRoutes(), loadVehicles(), loadDrivers(), loadOrders()])
                  }} 
                />
              } />
              <Route path=":id" element={<RouteDetailWrapper routes={mappedRoutes} orders={mappedOrders} routeApi={routeApi} loadRoutes={loadRoutes} loadOrders={loadOrders} loadVehicles={loadVehicles} loadDrivers={loadDrivers} />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'Admin', 'manager', 'Manager', 'operator', 'Operator', 'driver', 'Driver']} />}>
            <Route path="driver-routes" element={
              <DriverRoutesPage 
                currentRoute={activeDriverRoute}
                currentOrders={activeDriverOrders}
                pastRoutes={pastDriverRoutes} 
                onConfirmDispatch={async (id) => {
                  try {
                    await routeApi.confirmDispatch(id);
                    await Promise.allSettled([loadRoutes(), loadOrders(), loadDrivers(), loadVehicles()]);
                  } catch (err: any) {
                    alert(`Erro ao iniciar percurso: ${err.message}`);
                  }
                }}
                onConfirmArrival={async (orderId) => {
                  try {
                    await orderApi.confirmArrival(Number(orderId));
                    await Promise.allSettled([loadRoutes(), loadOrders(), loadDrivers(), loadVehicles()]);
                  } catch (err: any) {
                    alert(`Erro ao confirmar entrega: ${err.message}`);
                  }
                }}
                onReportAccident={async (orderId) => {
                  try {
                    const reason = prompt('Descreva o motivo do acidente/problema:');
                    if (reason) {
                      await orderApi.reportAccident(Number(orderId), { accidentMessage: reason });
                      await Promise.allSettled([loadRoutes(), loadOrders(), loadDrivers(), loadVehicles()]);
                    }
                  } catch (err: any) {
                    alert(`Erro ao reportar acidente: ${err.message}`);
                  }
                }}
                onViewOrderDetails={(id) => navigate(`/orders/${id}`)} 
                onViewRouteDetails={(id) => navigate(`/routes/${id}`)} 
                onReload={async () => {
                  await Promise.allSettled([loadRoutes(), loadOrders(), loadDrivers(), loadVehicles()]);
                }}
              />
            } />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['admin', 'Admin', 'manager', 'Manager']} />}>
            <Route path="users">
              <Route index element={<UserListPage users={safeUsers} onReload={loadUsers} onViewDetails={(id) => navigate(`/users/${id}`)} onEdit={(id) => navigate(`/users/${id}/edit`)} onCreate={() => navigate('/users/create')} />} />
              <Route path="create" element={<UserFormPage onSave={async (data) => { await registerUser(data as any); navigate('/users'); }} onCancel={() => navigate(-1)} />} />
              <Route path=":id" element={<UserDetailWrapper users={safeUsers} />} />
              <Route path=":id/edit" element={<UserFormWrapper users={safeUsers} onSave={async (data: any, username: string) => { await userApi.patch(username, data); loadUsers(); }} />} />
            </Route>
          </Route>
          
        </Route>
        
        <Route path="*" element={
          <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h2>Acesso Negado ou Rota Inexistente (404)</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Você não tem permissão para ver esta página ou ela não existe.</p>
            <Button onClick={() => navigate('/orders')}>Tentar ir para o Início</Button>
          </div>
        } />
      </Routes>
    </ErrorBoundary>
  )
}

// --- Componentes Wrappers ---
function OrderDetailWrapper({ orders, orderApi, loadOrders, loadRoutes, loadDrivers, loadVehicles }: any) {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = orders.find((o: any) => o?.id === id || String(o?.id) === String(id))
  
  if (!order) return <div>Pedido não encontrado.</div>

  const handleAction = async (actionType: string, orderId: number, payload?: any) => {
    try {
      switch (actionType) {
        case 'approve': await orderApi.approve(orderId); break;
        case 'reject': await orderApi.reject(orderId, payload); break;
        case 'cancel': await orderApi.cancel(orderId, payload); break;
        case 'confirm-payment': await orderApi.confirmPayment(orderId); break;
        case 'load': await orderApi.load(orderId, payload); break;
        case 'unload': await orderApi.unload(orderId); break;
        case 'report-accident': await orderApi.reportAccident(orderId, payload); break;
        case 'resolve-accident': await orderApi.resolveAccident(orderId, payload); break;
        case 'confirm-arrival': await orderApi.confirmArrival(orderId); break;
        default: console.warn('Ação desconhecida:', actionType);
      }
      
      // FIX: Aguardar que todo o estado global do back-end chegue antes de re-renderizar
      await Promise.allSettled([
        loadOrders(),
        loadRoutes(),
        loadDrivers(),
        loadVehicles()
      ])
      
    } catch (err: any) {
      alert(`Falha ao executar ação: ${err.message || 'Erro desconhecido.'}`)
    }
  }

  return <OrderDetailPage order={order} onBack={() => navigate('/orders')} onEdit={() => navigate(`/orders/${id}/edit`)} onAction={handleAction} />
}

function OrderFormWrapper({ orders, onSave }: { orders: any[], onSave: (data: any, id: string) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = orders.find((o: any) => o?.id === id || String(o?.id) === String(id))
  if (!order) return <div>Pedido não encontrado para edição.</div>
  return <OrderFormPage initialOrder={order} onSave={async (data) => { await onSave(data, id as string); navigate('/orders'); }} onCancel={() => navigate('/orders')} />
}

function VehicleDetailWrapper({ vehicles, routes, drivers }: any) {
  const { id } = useParams()
  const navigate = useNavigate()
  const vehicle = vehicles.find((v: any) => v?.id === id || v?.plate === id)
  if (!vehicle) return <div>Veículo não encontrado.</div>
  return <VehicleDetailPage vehicle={vehicle} routes={routes} drivers={drivers} onBack={() => navigate('/vehicles')} onEdit={() => navigate(`/vehicles/${id}/edit`)} onViewRoute={(routeId) => navigate(`/routes/${routeId}`)} />
}

function VehicleFormWrapper({ vehicles, onSave }: { vehicles: any[], onSave: (data: any, id: string) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const vehicle = vehicles.find((v: any) => v?.id === id || v?.plate === id)
  if (!vehicle) return <div>Veículo não encontrado para edição.</div>
  return <VehicleFormPage initialVehicle={vehicle} onSave={async (data) => { await onSave(data, id as string); navigate('/vehicles'); }} onCancel={() => navigate('/vehicles')} />
}

function DriverDetailWrapper({ drivers, routes, vehicles }: any) {
  const { id } = useParams()
  const navigate = useNavigate()
  const driver = drivers.find((d: any) => d?.id === id || d?.username === id)
  if (!driver) return <div>Motorista não encontrado.</div>
  return <DriverDetailPage driver={driver} routes={routes} vehicles={vehicles} onBack={() => navigate('/drivers')} onEdit={() => navigate(`/users/${id}/edit`)} onViewRoute={(routeId) => navigate(`/routes/${routeId}`)} />
}

function RouteDetailWrapper({ routes, orders, routeApi, loadRoutes, loadOrders, loadVehicles, loadDrivers }: any) {
  const { id } = useParams()
  const navigate = useNavigate()
  const route = routes.find((r: any) => r?.id === id)
  
  if (!route) return <div>Rota não encontrada.</div>
  
  const routeOrders = orders.filter((o: any) => route.orders?.includes(o?.id) || route.orders?.includes(String(o?.id)))
  
  const handleAuthorize = async (routeId: string) => {
    try {
      await routeApi.authorizeDispatch(routeId)
      // FIX: Sincronização estrita de estado após ação
      await Promise.allSettled([loadRoutes(), loadVehicles(), loadDrivers(), loadOrders()])
    } catch (err: any) {
      alert(`Erro ao autorizar: ${err.message}`)
    }
  }

  const handleUnauthorize = async (routeId: string) => {
    try {
      await routeApi.unauthorizeDispatch(routeId)
      // FIX: Sincronização estrita de estado após ação
      await Promise.allSettled([loadRoutes(), loadVehicles(), loadDrivers(), loadOrders()])
    } catch (err: any) {
      alert(`Erro ao desautorizar: ${err.message}`)
    }
  }

  return (
    <RouteDetailPage 
      route={route} 
      orders={routeOrders} 
      onBack={() => navigate('/routes')} 
      onViewOrder={(id) => navigate(`/orders/${id}`)} 
      onViewDriver={(id) => navigate(`/drivers/${id}`)} 
      onViewVehicle={(id) => navigate(`/vehicles/${id}`)}
      onAuthorizeDispatch={handleAuthorize}
      onUnauthorizeDispatch={handleUnauthorize}
    />
  )
}

function UserDetailWrapper({ users }: { users: any[] }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const userObj = users.find((u: any) => u?.username === id || u?.id === id)
  if (!userObj) return <div>Usuário não encontrado.</div>
  return <UserDetailPage user={userObj} onBack={() => navigate('/users')} onEdit={() => navigate(`/users/${id}/edit`)} />
}

function UserFormWrapper({ users, onSave }: { users: any[], onSave: (data: any, username: string) => Promise<void> }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const userObj = users.find((u: any) => u?.username === id || u?.id === id)
  if (!userObj) return <div>Usuário não encontrado para edição.</div>
  return <UserFormPage initialUser={userObj} onSave={async (data) => { await onSave(data, userObj.username); navigate(-1); }} onCancel={() => navigate(-1)} />
}