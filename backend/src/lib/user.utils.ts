// ------------- Funções para checagem de autorização, usa duck-typing -------------
// A diferença é que não se assume que os admins e gerentes podem fazer o trabalho
// do motorista.

import type { User } from "@/generated/prisma/client.ts"


export function isAdmin(user: User) {
  return user.role == 'ADMIN'
}

export function isManager(user: User) {
  return user.role == 'ADMIN' || user.role == 'MANAGER'
}

export function isClerk(user: User) {
  return user.role == 'CLERK' || user.role == 'ADMIN' || user.role == 'MANAGER'
}

export function isOperator(user: User) {
  return user.role == 'OPERATOR' || user.role == 'ADMIN' || user.role == 'MANAGER'
}

export function isDriver(user: User) {
  return user.role == 'DRIVER'
}

export function obfuscateCpf(cpf: string): string {
  return `***${cpf.substring(3, 10)}**`
}
