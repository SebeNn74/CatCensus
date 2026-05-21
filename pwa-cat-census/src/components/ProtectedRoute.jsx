import { Navigate, Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute() {
  const { token, logout } = useAuth()

  // Si no hay token, redirige al login
  if (!token) return <Navigate to="/login" replace />

  const navStyle = {
    display: 'flex',
    gap: '16px',
    padding: '16px 24px',
    backgroundColor: '#1f2937',
    color: 'white',
    alignItems: 'center'
  };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? '#60a5fa' : 'white',
    textDecoration: 'none',
    fontWeight: isActive ? 'bold' : 'normal'
  });

  // Si hay token, renderiza la barra de navegación y la ruta hija
  return (
    <div>
      <nav style={navStyle}>
        <div style={{ fontWeight: 'bold', marginRight: 'auto', fontSize: '1.2rem' }}>🐱 CatCensus</div>
        <NavLink to="/personas" style={linkStyle}>Personas</NavLink>
        <NavLink to="/mascotas" style={linkStyle}>Mascotas</NavLink>
        <NavLink to="/censo" style={linkStyle}>Censos</NavLink>
        <NavLink to="/mapa" style={linkStyle}>Mapa</NavLink>
        <button 
          onClick={logout} 
          style={{ 
            marginLeft: '16px', 
            padding: '6px 12px', 
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Salir
        </button>
      </nav>
      <div style={{ padding: '16px' }}>
        <Outlet />
      </div>
    </div>
  )
}

export default ProtectedRoute