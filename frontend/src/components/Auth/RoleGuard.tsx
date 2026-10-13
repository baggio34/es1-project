import React from 'react'
import { useAuth } from '../../contexts/AuthContext.tsx'

interface Props {
  allowedRoles: string[]
  children: React.ReactNode
}

export const RoleGuard: React.FC<Props> = ({ allowedRoles, children }) => {
  const { user } = useAuth()
  
  if (!user) return null

  // Normalizamos para minúsculas para garantir a validação exata
  const userRole = user.role.toLowerCase()
  const isAllowed = allowedRoles.some(r => r.toLowerCase() === userRole)

  return isAllowed ? <>{children}</> : null
}