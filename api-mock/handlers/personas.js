import { simulateNetworkDelay, validateToken, mockDatabase, saveDatabase, generateNewId } from '../db.js'

export async function handlePersonas(method, body, token, id) {
  await simulateNetworkDelay()

  if (method === 'GET') {
    if (id) {
      const persona = mockDatabase.personas.find(p => p.id === id)
      if (!persona) {
        return {
          status: 404,
          error: 'Persona no encontrada',
        }
      }
      // No retorna contraseña en GET
      const { contrasena, ...personaSinPassword } = persona
      return {
        status: 200,
        data: personaSinPassword,
      }
    } else {
      // Listar todas sin mostrar contraseña
      const personas = mockDatabase.personas.map(p => {
        const { contrasena, ...personaSinPassword } = p
        return personaSinPassword
      })
      return {
        status: 200,
        data: personas,
      }
    }
  }

  if (method === 'POST') {
    const data = typeof body === 'string' ? JSON.parse(body) : body

    const { nombres, apellidos, tipoDocumento, documento, direccion, telefono, ciudad } = data

    if (!nombres || !apellidos || !tipoDocumento || !documento) {
      return { 
        status: 400, 
        error: 'Campos requeridos: nombres, apellidos, tipoDocumento, documento' 
      }
    }

    // Verificar que no exista persona con el mismo documento
    const exists = mockDatabase.personas.find(p => p.documento === documento)
    if (exists) {
      return {
        status: 400,
        error: 'Ya existe una persona con este documento'
      }
    }

    const newPersona = {
      id: generateNewId(),
      nombres,
      apellidos,
      tipoDocumento,
      documento,
      direccion: direccion || '',
      telefono: telefono || '',
      ciudad: ciudad || ''
    }
    
    mockDatabase.personas.push(newPersona)
    saveDatabase()

    return {
      status: 201,
      data: newPersona,
    }
  }

  return { status: 405, error: 'Method Not Allowed' }
}
