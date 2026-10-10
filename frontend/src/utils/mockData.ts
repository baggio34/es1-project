import type { Driver } from '../models/driver.ts'
import type { Vehicle } from '../models/vehicle.ts'
import type { Order } from '../models/order.ts'
import type { Route } from '../models/route.ts'
import type { User } from '../models/user.ts'

export const mockUsers: User[] = [
  { id: 'U-001', name: 'Administrador Supremo', username: 'admin', role: 'Admin', condition: 'active' },
  { id: 'U-002', name: 'Gerente Logístico', username: 'gerente.log', role: 'Manager', condition: 'active' },
  { id: 'U-003', name: 'João Atendente', username: 'joao.atend', role: 'Clerk', condition: 'active' },
  { id: 'U-004', name: 'Carlos Motorista', username: 'carlos.mot', role: 'Driver', condition: 'active', licenses: ['A', 'B', 'C'] },
  { id: 'U-005', name: 'Usuario Desativado', username: 'inativo', role: 'Driver', condition: 'deactivated', licenses: ['B'] },
]

export const mockDrivers: Driver[] = [
  { id: 'D-001', name: 'Carlos Motorista', cpf: '12345678901', status: 'free' },
  { id: 'D-002', name: 'Fernando Caminhoneiro', cpf: '09876543210', status: 'onRoute', vehicleId: 'V-001', orderIds: ['O-001', 'O-002'] },
  { id: 'D-003', name: 'Marcos de Jesus', cpf: '11122233344', status: 'waitingDispatch', vehicleId: 'V-002', orderIds: ['O-003'] },
]

export const mockVehicles: Vehicle[] = [
  { id: 'V-001', plate: 'ABC-1234', model: 'Volvo FH 460', color: 'Branco', maxLoad: 30000, internalVolume: 120, status: 'onRoute', driverId: 'D-002' },
  { id: 'V-002', plate: 'XYZ-9876', model: 'Mercedes Sprinter', color: 'Prata', maxLoad: 5000, internalVolume: 15, status: 'waitingDispatch', driverId: 'D-003' },
  { id: 'V-003', plate: 'QWE-4433', model: 'Scania R450', color: 'Vermelho', maxLoad: 25000, internalVolume: 90, status: 'free' },
]

export const mockOrders: Order[] = [
  {
    id: 'O-001',
    status: 'onRoute',
    registeredOn: new Date(Date.now() - 86400000).toISOString(),
    description: 'Paletes de Eletrônicos',
    clientName: 'TechStore SA',
    clientRegistration: '12.345.678/0001-99',
    destination: 'São Paulo, SP',
    value: 150000,
    weight: 1200,
    volume: 15,
    driverId: 'D-002',
    vehicleId: 'V-001',
    routeId: 'R-001',
  },
  {
    id: 'O-002',
    status: 'onRoute',
    registeredOn: new Date(Date.now() - 90000000).toISOString(),
    description: 'Eletrodomésticos',
    clientName: 'Lojas Brasileiras',
    clientRegistration: '98.765.432/0001-11',
    destination: 'Campinas, SP',
    value: 45000,
    weight: 3400,
    volume: 30,
    driverId: 'D-002',
    vehicleId: 'V-001',
    routeId: 'R-001',
  },
  {
    id: 'O-003',
    status: 'waitingDispatch',
    registeredOn: new Date(Date.now() - 3600000).toISOString(),
    description: 'Carga Fracionada de Roupas',
    clientName: 'Moda Rápida',
    clientRegistration: '11.111.111/0001-11',
    destination: 'Rio de Janeiro, RJ',
    value: 12000,
    weight: 300,
    volume: 5,
    driverId: 'D-003',
    vehicleId: 'V-002',
  },
  {
    id: 'O-004',
    status: 'pendingApproval',
    registeredOn: new Date().toISOString(),
    description: 'Medicamentos Sensíveis',
    clientName: 'Farma Saúde',
    clientRegistration: '22.222.222/0001-22',
    destination: 'Curitiba, PR',
    value: 500000,
    weight: 200,
    volume: 2,
  },
  {
    id: 'O-005',
    status: 'arrived',
    registeredOn: new Date(Date.now() - 259200000).toISOString(),
    arrivedOn: new Date(Date.now() - 86400000).toISOString(),
    description: 'Materiais de Construção',
    clientName: 'ConstruTudo',
    clientRegistration: '33.333.333/0001-33',
    destination: 'Belo Horizonte, MG',
    value: 30000,
    weight: 15000,
    volume: 40,
    driverId: 'D-001',
    vehicleId: 'V-003',
    routeId: 'R-002',
  }
]

export const mockRoutes: Route[] = [
  {
    id: 'R-001',
    status: 'onCourse',
    driverId: 'D-002',
    vehicleId: 'V-001',
    orderIds: ['O-001', 'O-002'],
  },
  {
    id: 'R-002',
    status: 'completed',
    driverId: 'D-001',
    vehicleId: 'V-003',
    orderIds: ['O-005'],
  }
]
