import type { Driver } from '../../models/driver.ts'

export const initialMockDrivers: Driver[] = [
  {
    id: 'd1000000-0000-0000-0000-000000000001',
    name: 'Carlos Alberto Silva',
    cpf: '12345678901',
    status: 'onRoute',
    vehicleId: 'v2000000-0000-0000-0000-000000000001',
    orderIds: ['o3000000-0000-0000-0000-000000000001'],
  },
  {
    id: 'd1000000-0000-0000-0000-000000000002',
    name: 'Mariana Ferreira Ramos',
    cpf: '98765432100',
    status: 'waitingDispatch',
    vehicleId: 'v2000000-0000-0000-0000-000000000002',
    orderIds: ['o3000000-0000-0000-0000-000000000002'],
  },
  {
    id: 'd1000000-0000-0000-0000-000000000003',
    name: 'Roberto Mendes Santos',
    cpf: '45678912344',
    status: 'free',
  },
  {
    id: 'd1000000-0000-0000-0000-000000000004',
    name: 'Fernanda Oliveira Castro',
    cpf: '78912345688',
    status: 'free',
  },
]
