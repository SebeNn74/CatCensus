import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import PeoplePage from './pages/PeoplePage'
import PetsPage from './pages/PetsPage'
import CensusPage from './pages/CensusPage'
import MapPage from './pages/MapPage'

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas — requieren JWT */}
            <Route element={<ProtectedRoute />}>
              <Route path="/personas" element={<PeoplePage />} />
              <Route path="/mascotas" element={<PetsPage />} />
              <Route path="/censo" element={<CensusPage />} />
              <Route path="/mapa" element={<MapPage />} />
            </Route>

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
