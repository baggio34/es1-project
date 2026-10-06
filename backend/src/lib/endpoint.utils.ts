import type { FastifySchema } from "fastify";
import Type from "typebox";

export function payloadRequireTokenSchema<T, R>(body: T, response: R): FastifySchema {
  return {
    headers: Type.Object({
      token: Type.String({ format: 'uuid' })
    }),
    body,
    response: {
      200: response,
      400: Type.String(),
      401: Type.String(),
    }
  }
}

export function postSchema<T, R>(body: T, response: R): FastifySchema {
  return {
    body,
    response: {
      200: response,
      400: Type.String(),
      401: Type.String(),
    }
  }
}

export function requireTokenSchema<R>(response: R): FastifySchema {
  return {
    headers: Type.Object({
      token: Type.String({ format: 'uuid' })
    }),
    response: {
      200: response,
      400: Type.String(),
      401: Type.String(),
    }
  }
}
