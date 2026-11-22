import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
// Removida a importação de UserRole para evitar conflitos de tipagem, usando string genérica

interface ProtectedRouteProps {
  allowedRoles: string[]
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, redirectTo = '/orders' }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Normalizamos para minúsculas para evitar erros (ex: "Driver" vs "driver")
  const userRole = user.role.toLowerCase()
  const isAllowed = allowedRoles.some(r => r.toLowerCase() === userRole)

  if (!isAllowed) {
    // Se o usuário logado for Motorista, mandar pro painel dele, senao manda pro redirectTo (orders)
    const fallbackPath = userRole === 'driver' ? '/driver-routes' : redirectTo
    return <Navigate to={fallbackPath} replace />
  }

  return <Outlet />
}