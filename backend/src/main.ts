import fastify from 'fastify'
import calculatorRouter from './endpoints/calculator_endpoint.ts'

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

app.register(calculatorRouter)

app.listen({ port: 3000 }, (err, _address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
