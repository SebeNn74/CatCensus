import { simulateNetworkDelay, validateToken, mockDatabase, idCounters } from '../db.js'

export async function handleMascotas(method, body, token) {
  await simulateNetworkDelay()

  if (method === 'GET') {
    return {
      status: 200,
      data: mockDatabase.mascotas,
    }
  }

  if (method === 'POST') {
    if (!validateToken(token)) {
      return {
        status: 401,
        error: 'No autorizado',
      }
    }

    const mascota = typeof body === 'string' ? JSON.parse(body) : body
    const newMascota = {
      id: String(++idCounters.mascotas),
      ...mascota,
    }
    mockDatabase.mascotas.push(newMascota)

    return {
      status: 201,
      data: newMascota,
    }
  }

  return { status: 405, error: 'Method Not Allowed' }
}
