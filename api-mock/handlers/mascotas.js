import { simulateNetworkDelay, mockDatabase, saveDatabase, generateNewId } from '../db.js'

export async function handleMascotas(method, body, token, id) {
  await simulateNetworkDelay()

  if (method === 'GET') {
    if (id) {
      const mascota = mockDatabase.mascotas.find(m => m.id === id)
      if (!mascota) {
        return {
          status: 404,
          error: 'Mascota no encontrada',
        }
      }
      return {
        status: 200,
        data: mascota,
      }
    } else {
      return {
        status: 200,
        data: mockDatabase.mascotas,
      }
    }
  }

  if (method === 'POST') {
    const data = typeof body === 'string' ? JSON.parse(body) : body

    const { nombre, tipo, genero, edad, fotografia } = data

    if (!nombre || !tipo || !genero || edad === undefined) {
      return { 
        status: 400, 
        error: 'Campos requeridos: nombre, tipo, genero, edad' 
      }
    }

    const newMascota = {
      id: generateNewId(),
      nombre,
      tipo,
      genero,
      edad: parseFloat(edad),
      fotografia: fotografia || ''
    }
    
    mockDatabase.mascotas.push(newMascota)
    saveDatabase()

    return {
      status: 201,
      data: newMascota,
    }
  }

  return { status: 405, error: 'Method Not Allowed' }
}
