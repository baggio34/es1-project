import type { PrismaClient } from "@/generated/prisma/client.ts";
import assert from "assert";

// Classe para disponibilizar uma conexão com o ORM
export class PrismaContext {
  private static prismaClient: PrismaClient | null = null
  private constructor() {}
  
  public static getClient(): PrismaClient {
    assert(this.prismaClient, "A prisma client must be set before database eservices are called!")
    return this.prismaClient
  }

  public static setClient(client: PrismaClient) {
    console.log("[INFO]: Prisma client set up.")
    this.prismaClient = client
  }
} 
