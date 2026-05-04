import { useState } from 'react'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }) {
  // Intentamos recuperar el token si ya existía en sessionStorage
  const [token, setToken] = useState(
    () => sessionStorage.getItem('jwt') || null
  )

  const login = (jwt) => {
    sessionStorage.setItem('jwt', jwt)
    setToken(jwt)
  }

  const logout = () => {
    sessionStorage.removeItem('jwt')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}