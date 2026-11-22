import { isAdmin, isClerk, isDriver, isManager, isOperator } from "@/lib/user.utils.ts"
import type { RequestHandler } from "express"

export const requireManager: RequestHandler = async (req, res, next) => {
  if (!isManager(req.user)) {
    res.status(401).send({ error: "This action can only be performed by managers." })
    return
  }

  next()
}

export const requireDriver: RequestHandler = async (req, res, next) => {
  if (!isDriver(req.user)) {
    res.status(401).send({ error: "This action can only be performed by drivers." })
    return
  }

  next()
}

export const requireClerk: RequestHandler = async (req, res, next) => {
  if (!isClerk(req.user)) {
    res.status(401).send({ error: "This action can only be performed by clerks." })
    return
  }

  next()
}

export const requireOperatorOrClerk: RequestHandler = async (req, res, next) => {
  if (!isClerk(req.user)) {
    res.status(401).send({ error: "This action can only be performed by clerks or operators." })
    return
  }

  next()
}

export const requireOperator: RequestHandler = async (req, res, next) => {
  if (!isOperator(req.user)) {
    res.status(401).send({ error: "This action can only be performed by operators." })
    return
  }

  next()
}

export const requireAdmin: RequestHandler = async (req, res, next) => {
  if (!isAdmin(req.user)) {
    res.status(401).send({ error: "This action can only be performed by admins." })
    return
  }

  next()
}
