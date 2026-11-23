import type { ApiResult } from '@/api_result.ts'
import { LicenseManager } from '@/domain/license.manager.ts'
import type { CreateLicenseRequest, GetLicensesReply, UpdateLicenseRequest } from '@/dtos/license.dto.ts'

import { requireManager, requireOperator } from '@/services/auth/authorization.ts'
import express from 'express'
import type { Response, Request } from 'express'

export const licenseRouter = express.Router()
  .post("/", requireManager, handleCreateLicense)
  .put("/:id", requireManager, handleUpdateLicense)
  .delete("/:id", requireManager, handleDeleteLicense)
  .get("/", requireOperator, handleGetLicenses)


async function handleCreateLicense(req: Request<{}, ApiResult<'created'>, CreateLicenseRequest>, res: Response) {
  const result = await LicenseManager.getInstance().create(req.user!, req.body)

  res.status(result.isErr ? 400 : 201).send(result.map(() => 'created').toApiResult())
}

async function handleDeleteLicense(req: Request<{ id: string }, ApiResult<'deleted'>>, res: Response) {
  const result = await LicenseManager.getInstance().delete(req.params.id)

  res.status(result.isErr ? 400 : 200).send(result.map(() => 'deleted').toApiResult())
}

async function handleGetLicenses(_req: Request<{}, ApiResult<GetLicensesReply>>, res: Response) {
  res.status(200).send(await LicenseManager.getInstance().getAll())
}

async function handleUpdateLicense(req: Request<{ id: string }, ApiResult<'updated'>, UpdateLicenseRequest>, res: Response) {
  const result = await LicenseManager.getInstance().update(req.user!, req.params.id, req.body)

  res.status(result.isErr ? 400 : 200).send(result.map(() => 'updated').toApiResult())
}
