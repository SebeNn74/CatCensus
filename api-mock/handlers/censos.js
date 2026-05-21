import { simulateNetworkDelay, validateToken, mockDatabase, idCounters, saveDatabase } from '../db.js'

export async function handleCensos(method, body, token) {
  await simulateNetworkDelay()

  if (method === 'GET') {
    const dataWithDTO = mockDatabase.censos.map(censo => {
      const dueno = mockDatabase.personas.find(p => p.id === censo.idDueno);
      const mascota = mockDatabase.mascotas.find(m => m.id === censo.idMascota);
      
      return {
        ...censo,
        dueno: dueno ? {
          id: dueno.id,
          nombres: dueno.nombres || dueno.nombre,
          apellidos: dueno.apellidos || "",
          telefono: dueno.telefono
        } : null,
        mascota: mascota ? {
          id: mascota.id,
          nombre: mascota.nombre,
          tipo: mascota.tipo || mascota.raza,
          edad: mascota.edad
        } : null
      };
    });

    return {
      status: 200,
      data: dataWithDTO,
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
    saveDatabase()

    return {
      status: 201,
      data: newCenso,
    }
  }

  return { status: 405, error: 'Method Not Allowed' }
}
