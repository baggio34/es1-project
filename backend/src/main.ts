import fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import cors from '@fastify/cors'
import userRouter from './endpoints/user.endpoints.ts'
import vehicleRouter from './endpoints/vehicle.endpoints.ts'
import licenseRouter from './endpoints/license.endpoints.ts'
import orderRouter from './endpoints/order.endpoints.ts'
import driverRouter from './endpoints/driver.endpoints.ts'
import routeRouter from './endpoints/route.endpoints.ts'

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }
})

await app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Backend',
      version: '2.0.0'
    },
  }
})

await app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
})

await app.register(userRouter)
await app.register(vehicleRouter)
await app.register(licenseRouter)
await app.register(orderRouter)
await app.register(driverRouter)
await app.register(routeRouter)

app.listen({ port: 3000 }, (err, _address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
