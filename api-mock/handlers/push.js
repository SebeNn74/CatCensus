import { simulateNetworkDelay, validateToken, mockDatabase, saveDatabase, generateNewId, VAPID_PUBLIC_KEY } from '../db.js'

export async function handlePushKey(method) {
  await simulateNetworkDelay()

  if (method === 'GET') {
    return {
      status: 200,
      data: {
        publicKey: VAPID_PUBLIC_KEY
      }
    }
  }

  return { status: 405, error: 'Method Not Allowed' }
}

export async function handlePushSubscriptions(method, body, token) {
  await simulateNetworkDelay()

  if (method === 'POST') {
    if (!validateToken(token)) {
      return {
        status: 401,
        error: 'No autorizado',
      }
    }

    const data = typeof body === 'string' ? JSON.parse(body) : body
    const { endpoint, expirationTime, keys } = data

    if (!endpoint || !keys) {
      return { 
        status: 400, 
        error: 'Campos requeridos: endpoint, keys' 
      }
    }

    const newSubscription = {
      id: generateNewId(),
      endpoint,
      expirationTime: expirationTime || null,
      keys
    }
    
    mockDatabase.pushSubscriptions.push(newSubscription)
    saveDatabase()

    return {
      status: 204,
      data: null
    }
  }

  return { status: 405, error: 'Method Not Allowed' }
}
