import type { CreateUserRequest, UpdateUserRequest } from "@/dtos/user.dto.ts"
import type { LoginReply, LoginRequest } from "@/dtos/auth.dto.ts"
import type { PrismaClient, User } from "@/generated/prisma/client.ts"
import { Err, Ok, type Result } from "@/lib/result.ts"
import { isAdmin, isDriver, isManager } from "@/lib/user.utils.ts"
import { PrismaContext } from "@/services/database/prisma_context.ts"
import assert from "assert"
import { hash } from "crypto"
import type { DriverPreview, UserDetailed, UserPreview } from "@/models/user.ts"
import { slugify } from "@/lib/string.utils.ts"
import { serializeDates } from "@/lib/date.utils.ts"

export class UserManager {
  private static instance: UserManager | null
  private prisma: PrismaClient

  private constructor() {
    this.prisma = PrismaContext.getClient()
  }

  public static getInstance(): UserManager {
    if (!this.instance) {
      this.instance = new UserManager()
    }
    return this.instance
  }

  public async get(username: string): Promise<UserDetailed | null> {
    const user = await this.prisma.user.findFirst({
      where: { username },
      omit: { passwordHash: true, createdById: true, routeId: true },
      include: {
        licenses: {
          select: { license: { select: { id: true, name: true } } }
        },
        createdBy: {
          select: { username: true, name: true, id: true }
        },
        route: {
          select: {
            id: true,
            vehicle: { select: { id: true, color: true, model: true, plate: true } },
            driver: { select: { id: true, name: true, username: true } },
            status: true,
          }
        }
      }
    })

    if (!user) return null
    return {
      ...serializeDates(user),
      transportState: user.role === "DRIVER" ? (user.transportState ?? "FREE") : undefined,
      licenses: user.licenses.map(l => l.license),
    } as UserDetailed
  }

  public async getActiveDriver(username: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { username, isActive: true, role: "DRIVER" }
    })
  }

  public async getByToken(token: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        accessToken: token,
        isActive: true,
      }
    })
  }

  public async getAll(): Promise<UserPreview[]> {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        cpf: true,
        isActive: true,
        role: true,
      }
    })
  }

  public async getDrivers(): Promise<DriverPreview[]> {
    const drivers = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: "DRIVER",
      },
      select: {
        id: true,
        username: true,
        name: true,
        cpf: true,
        isActive: true,
        role: true,
        transportState: true,
        route: {
          select: {
            id: true,
            vehicle: { select: { id: true, color: true, model: true, plate: true } },
            driver: { select: { id: true, name: true, username: true } },
            status: true,
          }
        }
      },
    })

    return drivers.map(driver => ({
      ...driver,
      transportState: driver.transportState ?? "FREE",
    })) as DriverPreview[]
  }

  public async create(creator: User, data: CreateUserRequest): Promise<Result<'', 'usernameTaken'>> {
    assert(creator.isActive && isManager(creator))
    assert(isAdmin(creator) || (data.role != "ADMIN" && data.role != "MANAGER"))

    try {
      await this.prisma.user.create({
        data: {
          name: data.name,
          cpf: data.cpf,
          role: data.role,
          username: slugify(data.username),
          transportState: data.role == "DRIVER" ? "FREE" : undefined,
          licenses: data.role == "DRIVER" && data.licenseIds.length > 0
            ? {
                createMany: {
                  data: data.licenseIds.map(l => ({ licenseId: l }))
                }
              }
            : undefined,
          createdById: creator.id,
          passwordHash: hash('sha256', data.password),
        }
      })
    } catch (e) {
      console.error(e)
      return Err('usernameTaken')
    }
    return Ok('')
  }

  public async login({ username, password }: LoginRequest): Promise<Result<LoginReply, 'invalidCredentials'>> {
    const user = await this.prisma.user.findFirst({
      where: { username, isActive: true }
    })

    if (!user || user.passwordHash != hash('sha256', password)) return Err('invalidCredentials')

    const accessToken = crypto.randomUUID()
    await this.prisma.user.update({
      where: { username },
      data: { accessToken },
    })

    return Ok({
      token: accessToken,
      name: user.name,
      username: user.username,
      role: user.role,
    })
  }

  public async logout(username: string): Promise<Result<'', 'noSuchUser'>> {
    const user = await this.prisma.user.findFirst({
      where: { username, isActive: true }
    })

    if (!user) return Err('noSuchUser')

    await this.prisma.user.update({
      where: { username },
      data: { accessToken: null },
    })

    return Ok('')
  }

  public async update(requester: User, username: string, { password, licenseIds, ...data }: UpdateUserRequest): Promise<Result<'', 'noSuchUser' | 'notAuthorized' | 'badRequest' | 'usernameTaken' | 'driverNotFree'>> {
    assert(isManager(requester))

    const user = await this.prisma.user.findFirst({ where: { username } })
    if (!user) return Err('noSuchUser')
    if (isManager(user) && !isAdmin(requester)) return Err('notAuthorized')

    const normalizedUsername = data.username ? slugify(data.username) : undefined
    if (normalizedUsername && normalizedUsername !== username && await this.prisma.user.findFirst({ where: { username: normalizedUsername } })) {
      return Err('usernameTaken')
    }

    if (data.isActive === false && user.role == "DRIVER" && user.transportState != "FREE") {
      return Err('driverNotFree')
    }

    const passwordHash = password ? hash('sha256', password) : undefined
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { username },
          data: {
            ...data,
            username: normalizedUsername,
            passwordHash,
            licenses: isDriver(user) && licenseIds
              ? {
                  createMany: {
                    skipDuplicates: true,
                    data: licenseIds.map(l => ({ licenseId: l }))
                  }
                }
              : undefined
          }
        })

        if (isDriver(user) && licenseIds) {
          await tx.driverToLicense.deleteMany({
            where: { driverId: user.id, licenseId: { notIn: licenseIds } }
          })
        }
      })
    } catch (e) {
      return Err('badRequest')
    }

    return Ok('')
  }
}