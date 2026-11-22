import type { ApiResult } from '@/api_result.ts'
import { UserManager } from '@/domain/user.manager.ts'
import type { CreateUserRequest, GetUsersReply, GetUserReply, UpdateUserRequest } from '@/dtos/user.dto.ts'
import { isManager, obfuscateCpf } from '@/lib/user.utils.ts'
import { requireManager } from '@/services/auth/authorization.ts'
import express, { type Request, type Response } from 'express'

export const userRouter = express.Router()
  .post("/", requireManager, handleCreateUser)
  .patch("/:username", requireManager, handleUpdateUser)
  .get("/:username", handleGetUser)
  .get("/", handleGetUsers)


async function handleCreateUser(req: Request<{}, ApiResult<'created'>, CreateUserRequest>, res: Response) {
  const result = await UserManager.getInstance().create(req.user!, req.body)

  res.status(result.isErr ? 400 : 201).send(result.map(() => "created").toApiResult())
}

async function handleUpdateUser(req: Request<{ username: string }, ApiResult<'updated'>, UpdateUserRequest>, res: Response) {
  const { user, params, body } = req
  const result = await UserManager.getInstance().update(user!, params.username, body)

  res.status(result.isErr ? 400 : 201).send(result.map(() => "updated").toApiResult())
}

async function handleGetUser(req: Request<{ username: string }, ApiResult<GetUserReply>>, res: Response) {
  const { user, params } = req
  const result = await UserManager.getInstance().get(params.username)

  if (!result) {
    res.status(404).send({ error: `user @${params.username} not found.` })
    return
  }

  if (!isManager(user)) result.cpf = obfuscateCpf(result.cpf)
  res.status(200).send(result)
}

async function handleGetUsers(req: Request<{}, ApiResult<GetUsersReply>>, res: Response) {
  const { user } = req
  const result = await UserManager.getInstance().getAll()

  if (!isManager(user)) result.map(u => u.cpf = obfuscateCpf(u.cpf))
  res.status(200).send(result)
}
