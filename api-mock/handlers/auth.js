import { simulateNetworkDelay, MOCK_TOKEN, mockDatabase, idCounters, saveDatabase } from '../db.js'

export async function handleLogin(body) {
  await simulateNetworkDelay()
  const { usuario, contrasena } = typeof body === 'string' ? JSON.parse(body) : body

  const persona = mockDatabase.personas.find(p => p.user === usuario && p.password === contrasena)

  // Mantenemos el acceso si coincide con la base de datos o usamos el backdoor para pruebas rápidas
  if (persona || contrasena === 'password') {
    return {
      status: 200,
      data: {
        token: MOCK_TOKEN,
        usuario: persona ? persona.user : usuario,
        id: persona ? persona.id : '1',
        persona: persona || null
      },
    }
  }

  return {
    status: 401,
    error: 'Credenciales incorrectas',
  }
}

export async function handleRegister(body) {
  await simulateNetworkDelay()
  const data = typeof body === 'string' ? JSON.parse(body) : body

  if (!data.user || !data.password) {
    return { status: 400, error: 'Usuario y contraseña son requeridos' }
  }

  // Verificar si el usuario ya existe
  const exists = mockDatabase.personas.find(p => p.user === data.user)
  if (exists) {
    return {
      status: 400,
      error: 'El nombre de usuario ya está en uso'
    }
  }

  const newPersona = {
    id: String(++idCounters.personas),
    ...data,
  }
  
  mockDatabase.personas.push(newPersona)
  saveDatabase()

  return {
    status: 201,
    data: {
      token: MOCK_TOKEN,
      usuario: newPersona.user,
      id: newPersona.id,
      persona: newPersona
    }
  }
}
