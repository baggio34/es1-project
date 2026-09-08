import deletionRouter from '@/endpoints/deletion_endpoints.ts'
import registrationRouter from '@/endpoints/registration_endpoints.ts'
import retrievalRouter from '@/endpoints/retrieval_endpoints.ts'
import fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import orderProcessingRouter from '@/endpoints/order_processing_endpoints.ts'
import cors from '@fastify/cors'
import editingRouter from './endpoints/editing_endpoints.ts'

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
      version: '1.0.0'
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

await app.register(registrationRouter)
await app.register(deletionRouter)
await app.register(retrievalRouter)
await app.register(editingRouter)
await app.register(orderProcessingRouter)

app.listen({ port: 3000 }, (err, _address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
