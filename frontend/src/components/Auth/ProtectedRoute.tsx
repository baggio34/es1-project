import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import type { UserRole } from '../../models/user.ts'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, redirectTo = '/orders' }) => {
  const { user, hasRole } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!hasRole(allowedRoles)) {
    // Se o usuário logado for Motorista, mandar pro painel dele, senao manda pro redirectTo (orders)
    const fallbackPath = user.role === 'Driver' ? '/driver-routes' : redirectTo
    return <Navigate to={fallbackPath} replace />
  }

  return <Outlet />
}
