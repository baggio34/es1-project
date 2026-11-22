import type { ApiResult } from '@/api_result.ts'
import { VehicleManager } from '@/domain/vehicle.manager.ts'
import type { CreateVehicleRequest, GetVehicleReply, GetVehiclesReply, UpdateVehicleRequest } from '@/dtos/vehicle.dto.ts'
import { requireManager, requireOperator } from '@/services/auth/authorization.ts'
import express, { type Request, type Response } from 'express'

export const vehicleRouter = express.Router()
  .post("/", requireManager, handleCreateVehicle)
  .patch("/:plate", requireManager, handleUpdateVehicle)
  .get("/:plate", handleGetVehicle)
  .get("/", requireOperator, handleGetVehicles)


async function handleCreateVehicle(req: Request<{}, ApiResult<'created'>, CreateVehicleRequest>, res: Response) {
  const result = await VehicleManager.getInstance().create(req.user!, req.body)

  res.status(result.isErr ? 400 : 201).send(result.map(() => "created").toApiResult())
}

async function handleUpdateVehicle(req: Request<{ plate: string }, ApiResult<'updated'>, UpdateVehicleRequest>, res: Response) {
  const { user, params, body } = req
  const result = await VehicleManager.getInstance().update(user!, params.plate, body)

  res.status(result.isErr ? 400 : 201).send(result.map(() => "updated").toApiResult())
}

async function handleGetVehicle(req: Request<{ plate: string }, ApiResult<GetVehicleReply>>, res: Response) {
  const result = await VehicleManager.getInstance().get(req.params.plate)

  if (!result) {
    res.status(404).send({ error: `vehicle of plate '${req.params.plate}' not found.` })
    return
  }

  res.status(200).send(result)
}

async function handleGetVehicles(_req: Request<{}, ApiResult<GetVehiclesReply>>, res: Response) {
  const result = await VehicleManager.getInstance().getAll()

  res.status(200).send(result)
}
