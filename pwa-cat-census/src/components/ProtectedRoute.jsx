import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute() {
  const { token } = useAuth()

  // Si no hay token, redirige al login
  if (!token) return <Navigate to="/login" replace />

  // Si hay token, renderiza la ruta hija
  return <Outlet />
}

export default ProtectedRoute