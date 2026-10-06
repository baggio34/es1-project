// ------------- Funções para checagem de autorização, usa duck-typing -------------
// A diferença é que não se assume que os admins e gerentes podem fazer o trabalho
// do motorista.

import type { User } from "@/models/user.ts"

export function isAdmin(user: User) {
  return user.role == 'admin'
}

export function isManager(user: User) {
  return user.role == 'admin' || user.role == 'manager'
}

export function isClerk(user: User) {
  return user.role == 'clerk' || user.role == 'admin' || user.role == 'manager'
}

export function isOperator(user: User) {
  return user.role == 'operator' || user.role == 'admin' || user.role == 'manager'
}

export function isDriver(user: User) {
  return user.role == 'driver'
}

export function obfuscateCpf(cpf: string): string {
  return `***${cpf.substring(3, 10)}**`
}
