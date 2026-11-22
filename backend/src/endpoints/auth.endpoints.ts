import type { ApiResult } from '@/api_result.ts'
import { UserManager } from '@/domain/user.manager.ts'
import type { LoginReply, LoginRequest } from '@/dtos/auth.dto.ts'
import { authenticator } from '@/services/auth/authenticator.ts'
import express from 'express'
import type { Response, Request } from 'express'

export const loginRouter = express.Router()
  .post("/", handleLogin)
  .delete("/", authenticator, handleLogout)


async function handleLogin(req: Request<{}, ApiResult<LoginReply>, LoginRequest>, res: Response) {
  const result = await UserManager.getInstance().login(req.body)

  if (result.isErr) {
    res.status(401).send(result.toApiResult())
    return
  }

  res.status(200).send(result.toApiResult())
}

async function handleLogout(req: Request<{}, ApiResult<"loggedOut">>, res: Response) {
  const result = await UserManager.getInstance().logout(req.user!.username)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "loggedOut").toApiResult())
}
