import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface Props {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export const RoleGuard: React.FC<Props> = ({ allowedRoles, children }) => {
  const { hasRole } = useAuth()
  return hasRole(allowedRoles) ? <>{children}</> : null
}
