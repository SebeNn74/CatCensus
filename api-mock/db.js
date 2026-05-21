import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, 'data.json')

// Módulo de datos y utilidades compartidas para el Mock API
export const MOCK_TOKEN = 'mock_jwt_token_12345'
export const NETWORK_DELAY = 500 // ms

const defaultDatabase = {
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

export let mockDatabase = JSON.parse(JSON.stringify(defaultDatabase))
export let idCounters = {
  personas: 2,
  mascotas: 2,
  censos: 2,
}

try {
  if (fs.existsSync(DATA_FILE)) {
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(rawData)
    mockDatabase = parsed.mockDatabase || mockDatabase
    idCounters = parsed.idCounters || idCounters
  }
} catch (e) {
  console.error("No se pudo cargar data.json", e)
}

export function saveDatabase() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ mockDatabase, idCounters }, null, 2))
  } catch (e) {
    console.error("Error guardando en data.json", e)
  }
}

export function simulateNetworkDelay() {
  return new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY))
}

export function validateToken(authHeader) {
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token === MOCK_TOKEN
}

export function resetMockDatabase() {
  mockDatabase = JSON.parse(JSON.stringify(defaultDatabase))
  idCounters = {
    personas: 2,
    mascotas: 2,
    censos: 2,
  }
  saveDatabase()
}

export function getMockDatabase() {
  return mockDatabase
}
