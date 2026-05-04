// Mock API - Simula el comportamiento de la API real
// Almacena datos en memoria y responde con delays realistas

const MOCK_TOKEN = 'mock_jwt_token_12345'
const NETWORK_DELAY = 500 // milisegundos

// Base de datos simulada
let mockDatabase = {
  personas: [
    {
      id: '1',
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      telefono: '123456789',
      ubicacion: { lat: 4.7110, lng: -74.0721 },
    },
    {
      id: '2',
      nombre: 'María García',
      email: 'maria@example.com',
      telefono: '987654321',
      ubicacion: { lat: 4.7150, lng: -74.0750 },
    },
  ],
  mascotas: [
    {
      id: '1',
      nombre: 'Misi',
      raza: 'Persa',
      edad: 3,
      dueno: '1',
      color: 'Naranja',
      ubicacion: { lat: 4.7110, lng: -74.0721 },
    },
    {
      id: '2',
      nombre: 'Pelusa',
      raza: 'Siames',
      edad: 2,
      dueno: '2',
      color: 'Blanco y negro',
      ubicacion: { lat: 4.7150, lng: -74.0750 },
    },
  ],
  censos: [
    {
      id: '1',
      nombre: 'Censo Centro Bogotá',
      descripcion: 'Censo de gatos en la zona centro',
      fecha: '2024-03-15',
      ubicacion: { lat: 4.7110, lng: -74.0721 },
      idProyecto: 'PROPWA02',
      color: '#D400FF',
      totalGatos: 45,
    },
    {
      id: '2',
      nombre: 'Censo Zona Sur',
      descripcion: 'Censo de gatos en la zona sur',
      fecha: '2024-03-20',
      ubicacion: { lat: 4.6500, lng: -74.0800 },
      idProyecto: 'PROPWA02',
      color: '#D400FF',
      totalGatos: 32,
    },
  ],
}

// Contador para IDs
let idCounters = {
  personas: 2,
  mascotas: 2,
  censos: 2,
}

/**
 * Simula un delay de red
 */
function simulateNetworkDelay() {
  return new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY))
}

/**
 * Valida el token Bearer
 */
function validateToken(authHeader) {
  if (!authHeader) {
    return false
  }
  const token = authHeader.replace('Bearer ', '')
  return token === MOCK_TOKEN
}

/**
 * Procesa las requests de auth/login
 */
async function handleLogin(body) {
  await simulateNetworkDelay()

  const { usuario, contrasena } = JSON.parse(body)

  // Mock: Cualquier usuario con contraseña 'password' es válido
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

/**
 * Procesa las requests de personas
 */
async function handlePersonas(method, body, token) {
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

    const persona = JSON.parse(body)
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
}

/**
 * Procesa las requests de mascotas
 */
async function handleMascotas(method, body, token) {
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

    const mascota = JSON.parse(body)
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
}

/**
 * Procesa las requests de censos
 */
async function handleCensos(method, body, token) {
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

    const censo = JSON.parse(body)
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
}

/**
 * Inicializa el mock interceptando fetch globalmente
 * Solo funciona si el API_BASE_URL apunta a localhost o coincide con la URL configurada
 */
export function initializeMockApi() {
  const originalFetch = window.fetch

  window.fetch = async function (resource, config = {}) {
    const url = typeof resource === 'string' ? resource : resource.url
    const method = config.method || 'GET'
    const body = config.body
    const headers = config.headers || {}

    // Solo interceptar si es la URL de la API
    if (!url.includes('/api/v1')) {
      return originalFetch(resource, config)
    }

    console.log(`[MOCK API] ${method} ${url}`)

    // Extraer token del header
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

      // Crear respuesta simulada
      const response = new Response(JSON.stringify(result.data), {
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

  console.log('✅ Mock API inicializado. Usa: usuario=admin, contraseña=password')
}

/**
 * Resetea la base de datos a su estado inicial
 */
export function resetMockDatabase() {
  mockDatabase = {
    personas: [
      {
        id: '1',
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '123456789',
        ubicacion: { lat: 4.7110, lng: -74.0721 },
      },
      {
        id: '2',
        nombre: 'María García',
        email: 'maria@example.com',
        telefono: '987654321',
        ubicacion: { lat: 4.7150, lng: -74.0750 },
      },
    ],
    mascotas: [
      {
        id: '1',
        nombre: 'Misi',
        raza: 'Persa',
        edad: 3,
        dueno: '1',
        color: 'Naranja',
        ubicacion: { lat: 4.7110, lng: -74.0721 },
      },
      {
        id: '2',
        nombre: 'Pelusa',
        raza: 'Siames',
        edad: 2,
        dueno: '2',
        color: 'Blanco y negro',
        ubicacion: { lat: 4.7150, lng: -74.0750 },
      },
    ],
    censos: [
      {
        id: '1',
        nombre: 'Censo Centro Bogotá',
        descripcion: 'Censo de gatos en la zona centro',
        fecha: '2024-03-15',
        ubicacion: { lat: 4.7110, lng: -74.0721 },
        idProyecto: 'PROPWA02',
        color: '#D400FF',
        totalGatos: 45,
      },
      {
        id: '2',
        nombre: 'Censo Zona Sur',
        descripcion: 'Censo de gatos en la zona sur',
        fecha: '2024-03-20',
        ubicacion: { lat: 4.6500, lng: -74.0800 },
        idProyecto: 'PROPWA02',
        color: '#D400FF',
        totalGatos: 32,
      },
    ],
  }

  idCounters = {
    personas: 2,
    mascotas: 2,
    censos: 2,
  }

  console.log('🔄 Base de datos Mock reseteada')
}

/**
 * Obtiene la base de datos actual (útil para debugging)
 */
export function getMockDatabase() {
  return mockDatabase
}
