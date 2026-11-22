import type { ApiResult } from '@/api_result.ts'
import { OrderManager } from '@/domain/order.manager.ts'
import { RouteManager } from '@/domain/route.manager.ts'
import { UserManager } from '@/domain/user.manager.ts'
import { VehicleManager } from '@/domain/vehicle.manager.ts'
import type { CancelOrderRequest, CreateOrderRequest, GetOrderReply, GetOrdersReply, LoadOrderRequest, RejectOrderRequest, ReportOrderAccidentRequest, ResolveOrderAccidentRequest, UpdateOrderRequest } from '@/dtos/order.dto.ts'
import { requireClerk, requireDriver, requireManager, requireOperator, requireOperatorOrClerk } from '@/services/auth/authorization.ts'
import express, { type NextFunction, type Request, type Response } from 'express'

export const orderRouter = express.Router()
  .post("/orders", requireClerk, handleCreateOrder)
  .get("/orders", requireOperatorOrClerk, handleGetOrders)
  .get("/orders/:id", requireOrder, handleGetOrder)
  .patch("/orders/:id", requireOrder, requireManager, handleUpdateOrder)
  .post("/orders/:id/cancel", requireOrder, requireManager, handleCancelOrder)
  .post("/orders/:id/reject", requireOrder, requireOperator, handleRejectOrder)
  .post("/orders/:id/approve", requireOrder, requireOperator, handleApproveOrder)
  .post("/orders/:id/confirm-payment", requireOrder, requireClerk, handleConfirmOrderPayment)
  .post("/orders/:id/load", requireOrder, requireOperator, handleLoadOrder)
  .post("/orders/:id/unload", requireOrder, requireOperator, handleUnloadOrder)
  .post("/orders/:id/confirm-arrival", requireOrder, requireDriver, handleConfirmOrderArrival)
  .post("/orders/:id/report-accident", requireOrder, requireDriver, handleReportOrderAccident)
  .post("/orders/:id/resolve-accident", requireOrder, requireManager, handleResolveOrderAccident)


async function requireOrder(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    res.status(400).send("Invalid order id, must be a number")
    return
  }

  const order = await OrderManager.getInstance().getInternal(id)
  if (!order) {
    res.status(404).send(`Order not found. id: '${id}'`)
    return
  }

  req.order = order
  next()
}

async function handleCreateOrder(req: Request<{}, ApiResult<string>, CreateOrderRequest>, res: Response) {
  const result = await OrderManager.getInstance().create(req.user!, req.body)

  res.status(result.isErr ? 400 : 201).send(result.map(() => "created").toApiResult())
}

async function handleGetOrders(_req: Request<{}, ApiResult<GetOrdersReply>>, res: Response) {
  res.status(200).send(await OrderManager.getInstance().getAll())
}

async function handleGetOrder(req: Request<{}, ApiResult<GetOrderReply>>, res: Response) {
  const result = await OrderManager.getInstance().get(req.order!.id)

  res.status(!result ? 404 : 200).send(result)
}

async function handleUpdateOrder(req: Request<{}, ApiResult<string>, UpdateOrderRequest>, res: Response) {
  const result = await OrderManager.getInstance().update(req.user!, req.order!, req.body)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "updated").toApiResult())
}

async function handleCancelOrder(req: Request<{}, ApiResult<string>, CancelOrderRequest>, res: Response) {
  const result = await OrderManager.getInstance().cancel(req.user!, req.order!, req.body)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "cancelled").toApiResult())
}

async function handleRejectOrder(req: Request<{}, ApiResult<string>, RejectOrderRequest>, res: Response) {
  const result = await OrderManager.getInstance().reject(req.user!, req.order!, req.body)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "rejected").toApiResult())
}

async function handleApproveOrder(req: Request<{}, ApiResult<string>>, res: Response) {
  const result = await OrderManager.getInstance().approve(req.user!, req.order!)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "approved").toApiResult())
}

async function handleConfirmOrderPayment(req: Request<{}, ApiResult<string>>, res: Response) {
  const result = await OrderManager.getInstance().confirmPayment(req.user!, req.order!)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "confirmed").toApiResult())
}

async function handleLoadOrder(req: Request<{}, ApiResult<string>, LoadOrderRequest>, res: Response) {
  const { driverUsername, vehiclePlate } = req.body
  const driver = await UserManager.getInstance().getActiveDriver(driverUsername)
  const vehicle = await VehicleManager.getInstance().getActive(vehiclePlate)

  if (!driver) {
    res.status(404).send(`Driver not found. username: '${driverUsername}'`)
    return
  }

  if (!vehicle) {
    res.status(404).send(`Vehicle not found. plate: '${vehiclePlate}'`)
    return
  }

  const result = await RouteManager.getInstance().loadOrder(req.user!, req.order!, driver, vehicle)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "loaded").toApiResult())
}

async function handleUnloadOrder(req: Request<{}, ApiResult<string>>, res: Response) {
  const result = await RouteManager.getInstance().unloadOrder(req.order!)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "unloaded").toApiResult())
}

async function handleConfirmOrderArrival(req: Request<{}, ApiResult<string>>, res: Response) {
  const result = await OrderManager.getInstance().confirmArrival(req.user!, req.order!)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "unloaded").toApiResult())
}

async function handleReportOrderAccident(req: Request<{}, ApiResult<string>, ReportOrderAccidentRequest>, res: Response) {
  const result = await OrderManager.getInstance().reportAccident(req.user!, req.order!, req.body)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "reported accident").toApiResult())
}

async function handleResolveOrderAccident(req: Request<{}, ApiResult<string>, ResolveOrderAccidentRequest>, res: Response) {
  const result = await OrderManager.getInstance().resolveAccident(req.user!, req.order!, req.body)

  res.status(result.isErr ? 400 : 200).send(result.map(() => "resolved accident").toApiResult())
}
