import { useState } from 'react'
import { AppLayout } from '../components/Layout/AppLayout.tsx'
import type { DomainType } from '../components/Layout/Sidebar.tsx'

// Models
import type { DriverFormData } from '../models/driver.ts'
import type { VehicleFormData } from '../models/vehicle.ts'
import type { OrderFormData } from '../models/order.ts'

// Custom Hooks (View Models)
import { useDriver } from '../view_models/useDriver.ts'
import { useVehicle } from '../view_models/useVehicle.ts'
import { useOrder } from '../view_models/useOrder.ts'

// Driver Pages
import { DriverListPage } from './Drivers/DriverListPage.tsx'
import { DriverDetailPage } from './Drivers/DriverDetailPage.tsx'
import { DriverFormPage } from './Drivers/DriverFormPage.tsx'

// Vehicle Pages
import { VehicleListPage } from './Vehicles/VehicleListPage.tsx'
import { VehicleDetailPage } from './Vehicles/VehicleDetailPage.tsx'
import { VehicleFormPage } from './Vehicles/VehicleFormPage.tsx'

// Order Pages
import { OrderListPage } from './Orders/OrderListPage.tsx'
import { OrderDetailPage } from './Orders/OrderDetailPage.tsx'
import { OrderFormPage } from './Orders/OrderFormPage.tsx'

export type ViewMode = 'list' | 'detail' | 'create' | 'edit'

export default function App() {
  const [currentDomain, setCurrentDomain] = useState<DomainType>('orders')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Consumindo os hooks conectados ao backend Fastify
  const {
    drivers,
    loading: loadingDrivers,
    error: errorDrivers,
    saveDriver,
    deleteDriver,
  } = useDriver()

  const {
    vehicles,
    loading: loadingVehicles,
    error: errorVehicles,
    saveVehicle,
    deleteVehicle,
  } = useVehicle()

  const {
    orders,
    loading: loadingOrders,
    error: errorOrders,
    saveOrder,
    deleteOrder,
  } = useOrder()

  // Navegação entre domínios
  const handleSelectDomain = (domain: DomainType) => {
    setCurrentDomain(domain)
    setViewMode('list')
    setSelectedId(null)
  }

  // --- Handlers de Motoristas ---
  const handleSaveDriver = async (data: DriverFormData) => {
    try {
      await saveDriver(data, selectedId)
      setViewMode('list')
      setSelectedId(null)
    } catch (err) {
      // O erro já é tratado no hook, mas é capturado aqui para evitar a troca de tela
    }
  }

  const handleDeleteDriver = async (id: string) => {
    await deleteDriver(id)
  }

  // --- Handlers de Veículos ---
  const handleSaveVehicle = async (data: VehicleFormData) => {
    try {
      await saveVehicle(data, selectedId)
      setViewMode('list')
      setSelectedId(null)
    } catch (err) {
      // Impede a troca de tela em caso de falha no backend
    }
  }

  const handleDeleteVehicle = async (id: string) => {
    await deleteVehicle(id)
  }

  // --- Handlers de Pedidos ---
  const handleSaveOrder = async (data: OrderFormData) => {
    try {
      await saveOrder(data, selectedId)
      setViewMode('list')
      setSelectedId(null)
    } catch (err) {
      // Impede a troca de tela em caso de falha no backend
    }
  }

  const handleDeleteOrder = async (id: string) => {
    await deleteOrder(id)
  }

  // Títulos para o layout
  const domainTitles: Record<DomainType, string> = {
    orders: 'Gerência de Pedidos',
    vehicles: 'Gerência de Frota',
    drivers: 'Gerência de Motoristas',
  }

  const pageActionTitles: Record<ViewMode, string | undefined> = {
    list: undefined,
    detail: 'Visualização de Detalhes',
    create: 'Novo Cadastro',
    edit: 'Edição de Cadastro',
  }

  // Renderização do Conteúdo com base na rota
  const renderContent = () => {
    // 1. DOMÍNIO MOTORISTAS
    if (currentDomain === 'drivers') {
      if (loadingDrivers) return <div>Carregando motoristas...</div>
      if (errorDrivers) return <div className="text-red-500">Erro: {errorDrivers}</div>

      if (viewMode === 'detail' && selectedId) {
        const driver = drivers.find((d) => d.id === selectedId)
        if (!driver) return <div>Motorista não encontrado.</div>
        return (
          <DriverDetailPage
            driver={driver}
            onBack={() => setViewMode('list')}
            onEdit={(id) => {
              setSelectedId(id)
              setViewMode('edit')
            }}
          />
        )
      }

      if (viewMode === 'create' || (viewMode === 'edit' && selectedId)) {
        const driver = viewMode === 'edit' ? drivers.find((d) => d.id === selectedId) : null
        return (
          <DriverFormPage
            initialDriver={driver}
            onSave={handleSaveDriver}
            onCancel={() => setViewMode('list')}
          />
        )
      }

      return (
        <DriverListPage
          drivers={drivers}
          onViewDetails={(id) => {
            setSelectedId(id)
            setViewMode('detail')
          }}
          onEdit={(id) => {
            setSelectedId(id)
            setViewMode('edit')
          }}
          onCreate={() => setViewMode('create')}
          onDelete={handleDeleteDriver}
        />
      )
    }

    // 2. DOMÍNIO FROTA (VEÍCULOS)
    if (currentDomain === 'vehicles') {
      if (loadingVehicles) return <div>Carregando veículos...</div>
      if (errorVehicles) return <div className="text-red-500">Erro: {errorVehicles}</div>

      if (viewMode === 'detail' && selectedId) {
        const vehicle = vehicles.find((v) => v.id === selectedId)
        if (!vehicle) return <div>Veículo não encontrado.</div>
        return (
          <VehicleDetailPage
            vehicle={vehicle}
            onBack={() => setViewMode('list')}
            onEdit={(id) => {
              setSelectedId(id)
              setViewMode('edit')
            }}
          />
        )
      }

      if (viewMode === 'create' || (viewMode === 'edit' && selectedId)) {
        const vehicle = viewMode === 'edit' ? vehicles.find((v) => v.id === selectedId) : null
        return (
          <VehicleFormPage
            initialVehicle={vehicle}
            onSave={handleSaveVehicle}
            onCancel={() => setViewMode('list')}
          />
        )
      }

      return (
        <VehicleListPage
          vehicles={vehicles}
          onViewDetails={(id) => {
            setSelectedId(id)
            setViewMode('detail')
          }}
          onEdit={(id) => {
            setSelectedId(id)
            setViewMode('edit')
          }}
          onCreate={() => setViewMode('create')}
          onDelete={handleDeleteVehicle}
        />
      )
    }

    // 3. DOMÍNIO PEDIDOS
    if (loadingOrders) return <div>Carregando pedidos...</div>
    if (errorOrders) return <div className="text-red-500">Erro: {errorOrders}</div>

    if (viewMode === 'detail' && selectedId) {
      const order = orders.find((o) => o.id === selectedId)
      if (!order) return <div>Pedido não encontrado.</div>
      return (
        <OrderDetailPage
          order={order}
          onBack={() => setViewMode('list')}
          onEdit={(id) => {
            setSelectedId(id)
            setViewMode('edit')
          }}
        />
      )
    }

    if (viewMode === 'create' || (viewMode === 'edit' && selectedId)) {
      const order = viewMode === 'edit' ? orders.find((o) => o.id === selectedId) : null
      return (
        <OrderFormPage
          initialOrder={order}
          onSave={handleSaveOrder}
          onCancel={() => setViewMode('list')}
        />
      )
    }

    return (
      <OrderListPage
        orders={orders}
        onViewDetails={(id) => {
          setSelectedId(id)
          setViewMode('detail')
        }}
        onEdit={(id) => {
          setSelectedId(id)
          setViewMode('edit')
        }}
        onCreate={() => setViewMode('create')}
        onDelete={handleDeleteOrder}
      />
    )
  }

  return (
    <AppLayout
      currentDomain={currentDomain}
      onSelectDomain={handleSelectDomain}
      domainTitle={domainTitles[currentDomain]}
      pageTitle={pageActionTitles[viewMode]}
      counts={{
        orders: orders.length,
        vehicles: vehicles.length,
        drivers: drivers.length,
      }}
    >
      {renderContent()}
    </AppLayout>
  )
}