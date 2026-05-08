import { simulateNetworkDelay, validateToken, mockDatabase, idCounters } from '../db.js'

export async function handleCensos(method, body, token) {
  await simulateNetworkDelay()

  if (method === 'GET') {
    return {
      status: 200,
      data: mockDatabase.censos,
    }
  }

  if (method === 'POST') {
    if (!validateToken(token)) {
      return {
        status: 401,
        error: 'No autorizado',
      }
    }

    const censo = typeof body === 'string' ? JSON.parse(body) : body
    const newCenso = {
      id: String(++idCounters.censos),
      ...censo,
    }
    mockDatabase.censos.push(newCenso)

    return {
      status: 201,
      data: newCenso,
    }
  }

  return { status: 405, error: 'Method Not Allowed' }
}
