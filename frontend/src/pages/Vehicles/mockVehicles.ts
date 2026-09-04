import type { Vehicle } from '../../models/vehicle.ts'

export const initialMockVehicles: Vehicle[] = [
  {
    id: 'v2000000-0000-0000-0000-000000000001',
    model: 'Mercedes-Benz Sprinter 415 CDI',
    plate: 'ABC1D23',
    color: 'Branco',
    internalVolume: 14.5,
    maxLoad: 1500,
    status: 'onRoute',
    driverId: 'd1000000-0000-0000-0000-000000000001',
    orderIds: ['o3000000-0000-0000-0000-000000000001'],
  },
  {
    id: 'v2000000-0000-0000-0000-000000000002',
    model: 'Volkswagen Delivery 9.170',
    plate: 'XYZ9K88',
    color: 'Azul',
    internalVolume: 28.0,
    maxLoad: 5500,
    status: 'waitingDispatch',
    driverId: 'd1000000-0000-0000-0000-000000000002',
    orderIds: ['o3000000-0000-0000-0000-000000000002'],
  },
  {
    id: 'v2000000-0000-0000-0000-000000000003',
    model: 'Volvo FH 540 6x4',
    plate: 'LOG7A11',
    color: 'Prata',
    internalVolume: 90.0,
    maxLoad: 25000,
    status: 'free',
  },
  {
    id: 'v2000000-0000-0000-0000-000000000004',
    model: 'Scania R 450 Highline',
    plate: 'BRS4E55',
    color: 'Branco',
    internalVolume: 85.0,
    maxLoad: 22000,
    status: 'free',
  },
]
