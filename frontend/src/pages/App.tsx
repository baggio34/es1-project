import { useState } from 'react'
import { AppLayout } from '../components/Layout/AppLayout.tsx'
import type { DomainType } from '../components/Layout/Sidebar.tsx'

// Models
import type { Driver, DriverFormData } from '../models/driver.ts'
import type { Vehicle, VehicleFormData } from '../models/vehicle.ts'
import type { Order, OrderFormData } from '../models/order.ts'

// Mocks
import { initialMockDrivers } from './Drivers/mockDrivers.ts'
import { initialMockVehicles } from './Vehicles/mockVehicles.ts'
import { initialMockOrders } from './Orders/mockOrders.ts'

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

  // Estados locais mockados para simular reatividade visual completa
  const [drivers, setDrivers] = useState<Driver[]>(initialMockDrivers)
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialMockVehicles)
  const [orders, setOrders] = useState<Order[]>(initialMockOrders)

  // Navegação entre domínios
  const handleSelectDomain = (domain: DomainType) => {
    setCurrentDomain(domain)
    setViewMode('list')
    setSelectedId(null)
  }

  // --- Handlers de Motoristas ---
  const handleSaveDriver = (data: DriverFormData) => {
    if (viewMode === 'edit' && selectedId) {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id !== selectedId) return d
          if (data.status === 'free') {
            return {
              id: d.id,
              name: data.name,
              cpf: data.cpf,
              status: 'free',
            }
          } else {
            return {
              id: d.id,
              name: data.name,
              cpf: data.cpf,
              status: data.status,
              vehicleId: data.vehicleId || ('vehicleId' in d ? d.vehicleId : 'v2000000-0000-0000-0000-000000000001'),
              orderIds: 'orderIds' in d ? d.orderIds : [],
            }
          }
        })
      )
    } else {
      const newDriver: Driver =
        data.status === 'free'
          ? {
              id: crypto.randomUUID(),
              name: data.name,
              cpf: data.cpf,
              status: 'free',
            }
          : {
              id: crypto.randomUUID(),
              name: data.name,
              cpf: data.cpf,
              status: data.status,
              vehicleId: 'v2000000-0000-0000-0000-000000000001',
              orderIds: [],
            }
      setDrivers((prev) => [newDriver, ...prev])
    }
    setViewMode('list')
    setSelectedId(null)
  }

  const handleDeleteDriver = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id))
  }

  // --- Handlers de Veículos ---
  const handleSaveVehicle = (data: VehicleFormData) => {
    if (viewMode === 'edit' && selectedId) {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id !== selectedId) return v
          if (data.status === 'free') {
            return {
              id: v.id,
              model: data.model,
              plate: data.plate,
              color: data.color,
              internalVolume: data.internalVolume,
              maxLoad: data.maxLoad,
              status: 'free',
            }
          } else {
            return {
              id: v.id,
              model: data.model,
              plate: data.plate,
              color: data.color,
              internalVolume: data.internalVolume,
              maxLoad: data.maxLoad,
              status: data.status,
              driverId: data.driverId || ('driverId' in v ? v.driverId : 'd1000000-0000-0000-0000-000000000001'),
              orderIds: 'orderIds' in v ? v.orderIds : [],
            }
          }
        })
      )
    } else {
      const newVehicle: Vehicle =
        data.status === 'free'
          ? {
              id: crypto.randomUUID(),
              model: data.model,
              plate: data.plate,
              color: data.color,
              internalVolume: data.internalVolume,
              maxLoad: data.maxLoad,
              status: 'free',
            }
          : {
              id: crypto.randomUUID(),
              model: data.model,
              plate: data.plate,
              color: data.color,
              internalVolume: data.internalVolume,
              maxLoad: data.maxLoad,
              status: data.status,
              driverId: 'd1000000-0000-0000-0000-000000000001',
              orderIds: [],
            }
      setVehicles((prev) => [newVehicle, ...prev])
    }
    setViewMode('list')
    setSelectedId(null)
  }

  const handleDeleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id))
  }

  // --- Handlers de Pedidos ---
  const handleSaveOrder = (data: OrderFormData) => {
    if (viewMode === 'edit' && selectedId) {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== selectedId) return o
          return {
            ...o,
            description: data.description,
            clientName: data.clientName,
            clientCpf: data.clientCpf,
            destination: data.destination,
            value: data.value,
            weight: data.weight,
            volume: data.volume,
            status: data.status || o.status,
          } as Order
        })
      )
    } else {
      const baseOrder = {
        id: crypto.randomUUID(),
        registeredOn: new Date().toISOString(),
        description: data.description,
        clientName: data.clientName,
        clientCpf: data.clientCpf,
        destination: data.destination,
        value: data.value,
        weight: data.weight,
        volume: data.volume,
      }

      let newOrder: Order
      const st = data.status || 'pendingApproval'
      if (st === 'waitingDispatch' || st === 'onRoute') {
        newOrder = {
          ...baseOrder,
          status: st,
          driverId: 'd1000000-0000-0000-0000-000000000001',
          vehicleId: 'v2000000-0000-0000-0000-000000000001',
        }
      } else if (st === 'arrived') {
        newOrder = {
          ...baseOrder,
          status: 'arrived',
          driverId: 'd1000000-0000-0000-0000-000000000001',
          vehicleId: 'v2000000-0000-0000-0000-000000000001',
          arrivedOn: new Date().toISOString(),
        }
      } else if (st === 'rejected') {
        newOrder = {
          ...baseOrder,
          status: 'rejected',
          reason: 'Cancelado pelo operador.',
        }
      } else if (st === 'accident') {
        newOrder = {
          ...baseOrder,
          status: 'accident',
          driverId: 'd1000000-0000-0000-0000-000000000001',
          vehicleId: 'v2000000-0000-0000-0000-000000000001',
          accidentMessage: 'Incidente registrado.',
          accidentTime: new Date().toISOString(),
        }
      } else {
        newOrder = {
          ...baseOrder,
          status: st as 'pendingApproval' | 'waitingPayment' | 'inPreparation',
        }
      }
      setOrders((prev) => [newOrder, ...prev])
    }
    setViewMode('list')
    setSelectedId(null)
  }

  const handleDeleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
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
