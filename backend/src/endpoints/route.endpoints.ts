import type { ApiResult } from '@/api_result.ts'
import { RouteManager } from '@/domain/route.manager.ts'
import type { GetRouteReply, GetRoutesReply } from '@/dtos/route.dto.ts'
import { requireDriver, requireOperator } from '@/services/auth/authorization.ts'
import express, { type NextFunction, type Request, type Response } from 'express'

export const routeRouter = express.Router()
  .get("/", requireOperator, handleGetRoutes)
  .get("/:id", requireRoute, handleGetRoute)
  .post("/:id/authorize-dispatch", requireRoute, requireOperator, handleAuthorizeRouteDispatch)
  .post("/:id/unauthorize-dispatch", requireRoute, requireOperator, handleUnauthorizeRouteDispatch)
  .post("/:id/confirm-dispatch", requireRoute, requireDriver, handleConfirmRouteDispatch)


async function requireRoute(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  const route = await RouteManager.getInstance().getInternal(req.params.id)
  if (!route) {
    res.status(404).send(`Route not found. id: '${req.params.id}'`)
    return
  }

  req.route = route
  next()
}

async function handleGetRoute(req: Request<{}, ApiResult<GetRouteReply>>, res: Response) {
  const route = await RouteManager.getInstance().get(req.route!.id)
  
  res.status(!route ? 404 : 200).send(route)
}

async function handleGetRoutes(_req: Request<{}, ApiResult<GetRoutesReply>>, res: Response) {
  res.status(200).send(await RouteManager.getInstance().getAll())
}

async function handleAuthorizeRouteDispatch(req: Request<{}, ApiResult<string>>, res: Response) {
  const result = await RouteManager.getInstance().authorizeDispatch(req.user!, req.route!)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "").toApiResult())
}

async function handleUnauthorizeRouteDispatch(req: Request<{}, ApiResult<string>>, res: Response) {
  const result = await RouteManager.getInstance().unauthorizeDispatch(req.route!)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "").toApiResult())
}

async function handleConfirmRouteDispatch(req: Request<{}, ApiResult<string>>, res: Response) {
  const result = await RouteManager.getInstance().confirmDispatch(req.user!, req.route!)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "").toApiResult())
}
