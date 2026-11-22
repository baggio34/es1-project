import type { ApiResult } from '@/api_result.ts'
import { RouteManager } from '@/domain/route.manager.ts'
import { UserManager } from '@/domain/user.manager.ts'
import type { GetDriverRoutesReply } from '@/dtos/route.dto.ts'
import type { GetDriversReply } from '@/dtos/user.dto.ts'
import { requireDriver, requireManager, requireOperator } from '@/services/auth/authorization.ts'
import express, { type Request, type Response } from 'express'

export const driverRouter = express.Router()
  .get("/my-routes", requireDriver, handleGetDriverRoutes)
  .get("/:username/routes", requireManager, handleGetDriverRoutesProtected)
  .get("/", requireOperator, handleGetDrivers)


async function handleGetDriverRoutes(req: Request<{}, ApiResult<GetDriverRoutesReply>>, res: Response) {
  const result = await RouteManager.getInstance().getAll(req.user!.username)

  res.status(200).send(result)
}

async function handleGetDriverRoutesProtected(req: Request<{ username: string }, ApiResult<GetDriverRoutesReply>>, res: Response) {
  const result = await RouteManager.getInstance().getAll(req.params.username)

  res.status(200).send(result)
}

async function handleGetDrivers(_req: Request<{}, ApiResult<GetDriversReply>>, res: Response) {
  const result = await UserManager.getInstance().getDrivers()

  res.status(200).send(result)
}
