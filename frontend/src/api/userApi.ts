import { apiFetch } from './client'
import type { LoginRequest, LoginReply } from '../../../sdk/src/dtos/auth.dto.ts'
import type { CreateUserRequest, UpdateUserRequest, GetUserReply, GetUsersReply } from '../../../sdk/src/dtos/user.dto.ts'

export const userApi = {
  login: (data: LoginRequest) =>
    apiFetch<LoginReply>('/login', { method: 'POST', body: JSON.stringify(data) }),

  register: (data: CreateUserRequest) =>
    apiFetch<string>('/users', { method: 'POST', body: JSON.stringify(data) }),

  patch: (username: string, data: Partial<UpdateUserRequest>) =>
    apiFetch<string>(`/users/${username}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getByUsername: (username: string) =>
    apiFetch<GetUserReply>(`/users/${username}`),

  getAll: () =>
    apiFetch<GetUsersReply>('/users'),
}