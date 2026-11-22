import { UserManager } from "@/domain/user.manager.ts"
import type { Request, Response, NextFunction } from "express"

export const authenticator = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("token")
  if (!token) {
    res.status(401).send({ error: "No `token` field present in request header." })
    return
  }

  const user = await UserManager.getInstance().getByToken(token)
  if (!user) {
    res.status(401).send({ error: "Invalid access token." })
    return
  }

  req.user = user

  next()
}
