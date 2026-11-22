import type { CreateLicenseRequest, UpdateLicenseRequest } from "@/dtos/license.dto.ts"
import type { PrismaClient, User } from "@/generated/prisma/client.ts"
import { Err, Ok, type Result } from "@/lib/result.ts"
import { isManager } from "@/lib/user.utils.ts"
import type { LicenseDetailed } from "@/models/license.ts"
import { PrismaContext } from "@/services/database/prisma_context.ts"
import assert from "assert"

/*
 * Classe que gerencia as licenças do sistema.
 */
export class LicenseManager {
  private static instance: LicenseManager | null
  private prisma: PrismaClient
  
  private constructor() {
    this.prisma = PrismaContext.getClient()
  }

  public static getInstance(): LicenseManager {
    if (!this.instance) {
      this.instance = new LicenseManager()
    }
    return this.instance
  }

  /**
   * Retorna todos as licenças.
   */
  public async getAll(): Promise<LicenseDetailed[]> {
    return await this.prisma.license.findMany({
      include: {
        createdBy: { select: { id: true, name: true, username: true } }
      }
    })
  }

  /**
   * Cria uma nova licença a pedido de [requester].
   * @param O gerente ou admin.
   */
  public async create(creator: User, data: CreateLicenseRequest): Promise<Result<'', 'unknownError'>> {
    assert(isManager(creator))

    await this.prisma.license.create({
      data: {
        ...data,
        createdBy: {
          connect: { id: creator.id }
        },
      }
    })

    return Ok('')
  }

  /**
   * Altera o nome de uma licença por pedido de `requester`.
   * @param requester gerente ou admin.
   */
  public async update(requester: User, id: string, { name }: UpdateLicenseRequest): Promise<Result<'', 'noSuchLicense' | 'unknownError'>> {
    assert(isManager(requester))

    const license = await this.prisma.license.findFirst({ where: { id } })
    if (!license) return Err('noSuchLicense')

    await this.prisma.license.update({
      where: { id },
      data: { name },
    })

    return Ok('')
  }

  /**
   * Deleta uma licença.
   */
  public async delete(id: string): Promise<Result<'', 'noSuchLicense' | 'unknownError'>> {
    const { count } = await this.prisma.license.deleteMany({ where: { id } })
    if (count == 0) return Err('noSuchLicense')

    return Ok('')
  }
}
