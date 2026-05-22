import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, 'data.json')

// Utilidades
function generateUUID() {
  // Usar crypto si está disponible para mayor aleatoriedad
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback a generación manual
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const VAPID_PUBLIC_KEY = 'BCEllqKoW7pNRWKR3p2H1PJh+sRLfMqXVhD0+A7wA2Q0aRpC8KN0K7m4b5L8Y8q8qP8m8r2P9s3T4u5V6w7X8Y'
export const NETWORK_DELAY = 100

const defaultDatabase = {
  personas: [
    {
      id: 'admin-uuid-001',
      nombres: 'Admin',
      apellidos: 'User',
      tipoDocumento: 'CC',
      documento: '0000000001',
      direccion: 'Calle Admin 123',
      telefono: '3001234567',
      ciudad: 'Bogotá',
      usuario: 'admin',
      contrasena: 'Admin123*'
    }
  ],
  mascotas: [],
  censos: [],
  pushSubscriptions: []
}

// Cargar la base de datos desde el archivo data.json si existe
function loadDatabaseFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsedData = JSON.parse(fileContent)
      return parsedData.mockDatabase || defaultDatabase
    }
  } catch (e) {
    console.warn("No se pudo cargar data.json, usando base de datos por defecto", e.message)
  }
  return JSON.parse(JSON.stringify(defaultDatabase))
}

export let mockDatabase = loadDatabaseFromFile()

export function generateToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const payload = Buffer.from(JSON.stringify({ 
    userId: 'admin-uuid-001',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  })).toString('base64')
  const signature = 'mock_signature'
  return `${header}.${payload}.${signature}`
}

export function saveDatabase() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ mockDatabase }, null, 2))
  } catch (e) {
    console.error("Error guardando en data.json", e)
  }
}

export function simulateNetworkDelay() {
  return new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY))
}

export function validateToken(authHeader) {
  if (!authHeader) return false
  return authHeader.startsWith('Bearer ')
}

export function resetMockDatabase() {
  mockDatabase = JSON.parse(JSON.stringify(defaultDatabase))
  saveDatabase()
}

export function getMockDatabase() {
  return mockDatabase
}

export function generateNewId() {
  return generateUUID()
}
