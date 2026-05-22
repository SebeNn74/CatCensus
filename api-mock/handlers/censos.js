import { simulateNetworkDelay, validateToken, mockDatabase, saveDatabase, generateNewId } from '../db.js'

export async function handleCensos(method, body, token, id) {
  await simulateNetworkDelay()

  if (method === 'GET') {
    if (id) {
      const censo = mockDatabase.censos.find(c => c.id === id)
      if (!censo) {
        return {
          status: 404,
          error: 'Censo no encontrado',
        }
      }
      
      const dueno = mockDatabase.personas.find(p => p.id === censo.idDueno)
      const mascota = mockDatabase.mascotas.find(m => m.id === censo.idMascota)
      
      return {
        status: 200,
        data: {
          ...censo,
          dueno: dueno ? {
            id: dueno.id,
            nombres: dueno.nombres,
            apellidos: dueno.apellidos,
            telefono: dueno.telefono
          } : null,
          mascota: mascota ? {
            id: mascota.id,
            nombre: mascota.nombre,
            tipo: mascota.tipo,
            edad: mascota.edad
          } : null
        }
      }
    } else {
      // Listar todos los censos con información anidada (DTO)
      const dataWithDTO = mockDatabase.censos.map(censo => {
        const dueno = mockDatabase.personas.find(p => p.id === censo.idDueno)
        const mascota = mockDatabase.mascotas.find(m => m.id === censo.idMascota)
        
        return {
          ...censo,
          fotografiaCenso: censo.fotografia,
          dueno: dueno ? {
            id: dueno.id,
            nombres: dueno.nombres,
            apellidos: dueno.apellidos,
            telefono: dueno.telefono
          } : null,
          mascota: mascota ? {
            id: mascota.id,
            nombre: mascota.nombre,
            tipo: mascota.tipo,
            edad: mascota.edad
          } : null
        }
      })
      
      return {
        status: 200,
        data: dataWithDTO,
      }
    }
  }

  if (method === 'POST') {
    if (!validateToken(token)) {
      return {
        status: 401,
        error: 'No autorizado',
      }
    }

    const data = typeof body === 'string' ? JSON.parse(body) : body
    const { idMascota, idDueno, fotografia, lat, lon, idProyecto, color } = data

    if (!idMascota || !idDueno || !fotografia || lat === undefined || lon === undefined || !idProyecto || !color) {
      return { 
        status: 400, 
        error: 'Campos requeridos: idMascota, idDueno, fotografia, lat, lon, idProyecto, color' 
      }
    }

    // Validar que existan la mascota y el dueño
    const mascota = mockDatabase.mascotas.find(m => m.id === idMascota)
    const dueno = mockDatabase.personas.find(p => p.id === idDueno)

    if (!mascota || !dueno) {
      return {
        status: 400,
        error: 'La mascota o el dueño no existen'
      }
    }

    // Validar tamaño de la fotografía (máximo 50KB)
    // Aprox: 1 carácter base64 = 0.75 bytes
    const fotoSize = fotografia.length * 0.75
    if (fotoSize > 50000) {
      return {
        status: 400,
        error: 'La fotografía excede el límite de 50KB'
      }
    }

    const newCenso = {
      id: generateNewId(),
      idMascota,
      idDueno,
      fotografia,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      idProyecto,
      color
    }
    
    mockDatabase.censos.push(newCenso)
    saveDatabase()

    return {
      status: 201,
      data: {
        ...newCenso,
        fotografiaCenso: newCenso.fotografia,
        dueno: dueno ? {
          id: dueno.id,
          nombres: dueno.nombres,
          apellidos: dueno.apellidos,
          telefono: dueno.telefono
        } : null,
        mascota: mascota ? {
          id: mascota.id,
          nombre: mascota.nombre,
          tipo: mascota.tipo,
          edad: mascota.edad
        } : null
      },
    }
  }

  return { status: 405, error: 'Method Not Allowed' }
}
