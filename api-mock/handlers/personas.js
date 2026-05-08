import { simulateNetworkDelay, validateToken, mockDatabase, idCounters } from '../db.js'

export async function handlePersonas(method, body, token) {
  await simulateNetworkDelay()

  if (method === 'GET') {
    return {
      status: 200,
      data: mockDatabase.personas,
    }
  }

  if (method === 'POST') {
    if (!validateToken(token)) {
      return {
        status: 401,
        error: 'No autorizado',
      }
    }

    const persona = typeof body === 'string' ? JSON.parse(body) : body
    const newPersona = {
      id: String(++idCounters.personas),
      ...persona,
    }
    mockDatabase.personas.push(newPersona)

    return {
      status: 201,
      data: newPersona,
    }
  }

  return { status: 405, error: 'Method Not Allowed' }
}
