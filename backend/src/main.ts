import "dotenv/config"
import express from 'express'
import cors from 'cors'
import { PrismaContext } from './services/database/prisma_context.ts'
import { PrismaClient } from './generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'
import { authenticator } from './services/auth/authenticator.ts'
import { userRouter } from './endpoints/user.endpoints.ts'
import { loginRouter } from './endpoints/auth.endpoints.ts'
import { vehicleRouter } from "./endpoints/vehicle.endpoints.ts"
import { licenseRouter } from "./endpoints/license.endpoints.ts"
import { driverRouter } from "./endpoints/driver.endpoints.ts"
import { orderRouter } from "./endpoints/order.endpoints.ts"
import { routeRouter } from "./endpoints/route.endpoints.ts"

const app = express()

app.use(cors())
app.use(express.json())

// Inicializar a conexão com o banco de dados.
PrismaContext.setClient(
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
  })
)

// Endpoint para autenticação.
app.use('/login', loginRouter)

// Endpoints protegidos por autenticação.
const apiRouter = express.Router()
  .use(authenticator)
  .use('/users', userRouter)
  .use('/vehicles', vehicleRouter)
  .use('/licenses', licenseRouter)
  .use('/drivers', driverRouter)
  .use('/orders', orderRouter)
  .use('/routes', routeRouter)

app.use('/api', apiRouter)


app.listen(3000)
