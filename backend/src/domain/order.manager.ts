import { Err, Ok, type Result } from "@/lib/result.ts"
import type { CancelOrderRequest, SwapOrderIndex, CreateOrderRequest, RejectOrderRequest, ReportOrderAccidentRequest, ResolveOrderAccidentRequest, UpdateOrderRequest } from "@/dtos/order.dto.ts"
import { isClerk, isDriver, isManager, isOperator } from "@/lib/user.utils.ts"
import assert from "assert"
import type { Order, PrismaClient, User } from "@/generated/prisma/client.ts"
import { PrismaContext } from "@/services/database/prisma_context.ts"
import { nonCancellableOrderStatuses, type OrderDetailed, type OrderPreview } from "@/models/order.ts"
import { serializeDates } from "@/lib/date.utils.ts"

/**
 * Gerencia os pedidos do sistema.
 */
export class OrderManager {
  private static instance: OrderManager | null
  private prisma: PrismaClient
  
  private constructor() {
    this.prisma = PrismaContext.getClient()
  }

  public static getInstance(): OrderManager {
    if (!this.instance) {
      this.instance = new OrderManager()
    }
    return this.instance
  }

  public async getInternal(id: number): Promise<Order | null> {
    return await this.prisma.order.findFirst({ where: { id } })
  }

  /**
   * Retorna um pedido dado seu id.
   */
  public async get(id: number): Promise<OrderDetailed | null> {
    const order = await this.prisma.order.findFirst({
      where: { id },
      include: {
        createdBy: { select: { username: true, name: true, id: true, } },
        rejectedBy: { select: { username: true, name: true, id: true, } },
        approvedBy: { select: { username: true, name: true, id: true, } },
        paymentConfirmedBy: { select: { username: true, name: true, id: true, } },
        loadedBy: { select: { username: true, name: true, id: true, } },
        accidentResolvedBy: { select: { username: true, name: true, id: true, } },
        cancelledBy: { select: { username: true, name: true, id: true, } },

        licenses: { select: { license: { select: { id: true, name: true } } } },

        route: {
          include: {
            createdBy: { select: { username: true, name: true, id: true, } },
            dispatchApprovedBy: { select: { username: true, name: true, id: true, } },
            vehicle: { select: { id: true, color: true, model: true, plate: true } },
            driver: { select: { id: true, name: true, username: true } },
            orders: {
              select: {
                id: true,
                destination: true,
                clientName: true,
                clientRegistration: true,
                status: true,
                routeIndex: true,
              }
            },
          }
        }
      }
    })

    if (!order) return null
    return {
      ...serializeDates(order),
      route: order.route ? serializeDates(order.route) : null,
      licenses: order.licenses.map(l => l.license),
      statusBeforeCancellation: {
        ...serializeDates(order),
        status: order.statusBeforeCancellation,
      }
    } as OrderDetailed
  }

  /**
   * Retorna todos os pedidos.
   */
  public async getAll(): Promise<OrderPreview[]> {
    return await this.prisma.order.findMany({
      select: {
        id: true,
        destination: true,
        clientName: true,
        clientRegistration: true,
        weight: true,
        volume: true,
        status: true,
        route: {
          select: {
            id: true,
            vehicle: { select: { id: true, color: true, model: true, plate: true } },
            driver: { select: { id: true, name: true, username: true } },
            status: true,
          }
        }
      }
    }) as OrderPreview[]
  }

  /**
   * Cria um novo pedido por parte do atendente `clerk`.
   * Retorna o id do pedido.
   */
  public async create(clerk: User, { licenseIds, ...data }: CreateOrderRequest): Promise<Result<number, void>> {
    assert(clerk.isActive && isClerk(clerk))

    const order = await this.prisma.order.create({
      data: {
        ...data,
        licenses: {
          createMany: {
            data: licenseIds.map(l => ({ licenseId: l }))
          }
        },
        createdById: clerk.id,
      }
    })

    return Ok(order.id)
  }

  /**
   * Altera os dados de um pedido por ordem de `requester`.
   * @param requester gerente ou admin.
   */
  public async update(requester: User, order: Order, { licenseIds, ...data }: UpdateOrderRequest): Promise<Result<'', 'badRequest'>> {
    assert(isManager(requester))

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        ...data,
        licenses: licenseIds
          ? {
              createMany: {
                skipDuplicates: true,
                data: licenseIds.map(l => ({ licenseId: l }))
              }
            }
          : undefined
      }
    })

    // Remover licensas antigas
    if (licenseIds) {
      await this.prisma.orderToLicense.deleteMany({
        where: { orderId: order.id, licenseId: { notIn: licenseIds } }
      })
    }

    return Ok('')
  }

  /**
   * Cancela um pedido.
   */
  public async cancel(manager: User, order: Order, { reason }: CancelOrderRequest): Promise<Result<'', 'cantBeCancelled'>> {
    assert(manager.isActive && isManager(manager))

    if (nonCancellableOrderStatuses.find(s => s == order.status)) {
      return Err("cantBeCancelled")
    }

    if (order.status == "ON_ROUTE") await this.completeRoute(order)

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
        cancelledById: manager.id,
        cancelledOn: new Date()
      }
    })

    return Ok('')
  }

  /**
   * Reprova um pedido aguardando aprovação.
   */
  public async reject(operator: User, order: Order, { reason }: RejectOrderRequest): Promise<Result<'', 'notWaitingApproval'>> {
    assert(operator.isActive && isOperator(operator))
    if (order.status != 'WAITING_APPROVAL') return Err('notWaitingApproval')

    
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        rejectedById: operator.id,
        rejectedOn: new Date(),
      }
    })

    return Ok('')
  }


  /**
   * Aprova um pedido aguardando aprovação.
   */
  public async approve(operator: User, order: Order): Promise<Result<'', 'notWaitingApproval'>> {
    assert(operator.isActive && isOperator(operator))
    if (order.status != 'WAITING_APPROVAL') return Err('notWaitingApproval')
    
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: "WAITING_PAYMENT",
        approvedById: operator.id,
        approvedOn: new Date(),
      }
    })

    return Ok('')
  }

  /**
   * Confirma o pagamento de um pedido.
   */
  public async confirmPayment(clerk: User, order: Order): Promise<Result<'', 'notWaitingPaymentConfirmation'>> {
    assert(clerk.isActive && isClerk(clerk))
    if (order.status != 'WAITING_PAYMENT') return Err('notWaitingPaymentConfirmation')
    
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: "IN_PREPARATION",
        paymentConfirmedById: clerk.id,
        paymentConfirmedOn: new Date(),
      }
    })

    return Ok('')
  }

  private async deliveriesLeft(order: Order): Promise<number> {
    return this.prisma.order.count({
      where: {
        routeId: order.routeId,
        status: "ON_ROUTE",
      }
    })
  }

  public async completeRoute(order: Order) {
    assert(order.status == "ON_ROUTE")

    if (await this.deliveriesLeft(order) == 1) {
      const route = await this.prisma.route.update({
        where: { id: order.routeId! },
        data: {
          status: "COMPLETED",
          routeCompletedOn: new Date(),
        }
      })

      await this.prisma.vehicle.update({
        where: { id: route.vehicleId },
        data: { transportState: "FREE" }
      })

      await this.prisma.user.update({
        where: { id: route.driverId },
        data: { transportState: "FREE" }
      })
    }
  }

  /**
   * Reporta um acidente que ocorreu com um pedido.
   */
  public async reportAccident(driver: User, order: Order, { accident }: ReportOrderAccidentRequest): Promise<Result<"", "notAuthorized" | "noSuchOrder" | "noSuchDriver" | "orderNotOnRoute">> {
    assert(driver.isActive && isDriver(driver))

    if (order.status != 'ON_ROUTE') return Err('orderNotOnRoute')
    if (driver.routeId != order.routeId) return Err('notAuthorized')

    await this.completeRoute(order)

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: "ACCIDENT",
        accidentOn: new Date(),
        accidentDescription: accident,
      }
    })

    return Ok('')
  }

  /**
   * Resolve um acidente envolvendo um pedido.
   */
  public async resolveAccident(manager: User, order: Order, { description }: ResolveOrderAccidentRequest): Promise<Result<"", "noAccidentOccurred">> {
    assert(manager.isActive && isManager(manager))
    if (order.status != 'ACCIDENT') return Err('noAccidentOccurred')

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: "RESOLVED_ACCIDENT",
        accidentResolvedOn: new Date(),
        accidentResolvedById: manager.id,
        accidentResolutionDescription: description,
      }
    })

    return Ok('')
  }

  /**
   * Marca um pedido como entregue
   */
  public async confirmArrival(driver: User, order: Order): Promise<Result<"", "notAuthorized" | "orderNotOnRoute">> {
    assert(driver.isActive && isDriver(driver))

    if (order.status != 'ON_ROUTE') return Err('orderNotOnRoute')
    if (driver.routeId != order.routeId) return Err('notAuthorized')

    await this.completeRoute(order)

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: "ARRIVED",
        arrivedOn: new Date(),
      }
    })

    return Ok('')
  }

  /*
   * Troca a ordem de entrega de dois pedidos.
   */
  public async swapIndexes(order: Order, data: SwapOrderIndex): Promise<Result<'', 'cantBeEdited' | 'cantSwapWithThatOrder'>> {
    if (order.status != "LOADED") return Err('cantBeEdited')

    const other = await this.prisma.order.findFirst({
      where: {
        routeId: order.routeId!,
        id: data.swappedId,
      }
    })
    if (!other) return Err("cantSwapWithThatOrder")

    await this.prisma.order.update({
      where: {
        id: order.id
      },
      data: { routeIndex: other.routeIndex! }
    })

    await this.prisma.order.update({
      where: {
        id: other.id
      },
      data: { routeIndex: order.routeIndex! }
    })

    return Ok('')
  }
}
