import { handleLogin } from './handlers/auth.js'
import { handlePersonas } from './handlers/personas.js'
import { handleMascotas } from './handlers/mascotas.js'
import { handleCensos } from './handlers/censos.js'
import { simulateNetworkDelay, resetMockDatabase, getMockDatabase } from './db.js'

export function initializeMockApi() {
  const originalFetch = window.fetch

  window.fetch = async function (resource, config = {}) {
    const url = typeof resource === 'string' ? resource : resource.url
    const method = (config.method || 'GET').toUpperCase()
    const body = config.body
    const headers = config.headers || {}

    if (!url.includes('/api/v1')) {
      return originalFetch(resource, config)
    }

    console.log(`[MOCK API] ${method} ${url}`)

    const authHeader = headers.Authorization || headers.authorization

    try {
      let result

      if (url.includes('/auth/login')) {
        result = await handleLogin(body)
      } else if (url.includes('/personas')) {
        result = await handlePersonas(method, body, authHeader)
      } else if (url.includes('/mascotas')) {
        result = await handleMascotas(method, body, authHeader)
      } else if (url.includes('/censos')) {
        result = await handleCensos(method, body, authHeader)
      } else {
        return originalFetch(resource, config)
      }

      const responseBody = result.data !== undefined ? result.data : { error: result.error }

      const response = new Response(JSON.stringify(responseBody), {
        status: result.status,
        statusText: result.status === 200 || result.status === 201 ? 'OK' : 'Error',
        headers: { 'Content-Type': 'application/json' },
      })

      return response
    } catch (error) {
      console.error('[MOCK API ERROR]', error)
      return originalFetch(resource, config)
    }
  }
  console.log('✅ Mock API (interceptor) inicializado. Usa: usuario=admin, contraseña=password')
}

export { resetMockDatabase, getMockDatabase }
