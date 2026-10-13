import { apiFetch } from './client'
import type { LoginPayload, LoginReply, UserRegistrationPayload, UserPatchPayload, UserGetReply, User } from '../models/user'

export const userApi = {
  login: (data: LoginPayload) => 
    apiFetch<LoginReply>('/users/login', { method: 'POST', body: JSON.stringify(data) }),
    
  register: (data: UserRegistrationPayload) => 
    apiFetch<string>('/users/register', { method: 'POST', body: JSON.stringify(data) }),
    
  patch: (username: string, data: UserPatchPayload) => 
    apiFetch<string>(`/users/${username}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  getByUsername: (username: string) => 
    apiFetch<UserGetReply>(`/users/${username}`),
    
  getAll: () => 
    apiFetch<User[]>('/users'),
}