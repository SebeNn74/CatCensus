import { simulateNetworkDelay, MOCK_TOKEN } from '../db.js'

export async function handleLogin(body) {
  await simulateNetworkDelay()
  const { usuario, contrasena } = typeof body === 'string' ? JSON.parse(body) : body

  if (contrasena === 'password') {
    return {
      status: 200,
      data: {
        token: MOCK_TOKEN,
        usuario: usuario,
        id: '1',
      },
    }
  }

  return {
    status: 401,
    error: 'Credenciales incorrectas',
  }
}
