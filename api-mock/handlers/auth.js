import { simulateNetworkDelay, generateToken, mockDatabase, saveDatabase, generateNewId } from '../db.js'

export async function handleLogin(body) {
  await simulateNetworkDelay()
  const { usuario, contrasena } = typeof body === 'string' ? JSON.parse(body) : body

  if (!usuario || !contrasena) {
    return {
      status: 400,
      error: 'Usuario y contraseña son requeridos',
    }
  }

  const persona = mockDatabase.personas.find(p => p.usuario === usuario && p.contrasena === contrasena)

  if (persona) {
    return {
      status: 200,
      data: {
        token: generateToken(),
        tipoToken: 'Bearer',
        expiraEn: 3600
      },
    }
  }

  return {
    status: 401,
    data: null,
    error: 'Credenciales incorrectas',
  }
}

export async function handleRegistroPersona(body) {
  await simulateNetworkDelay()
  const data = typeof body === 'string' ? JSON.parse(body) : body

  const { nombres, apellidos, tipoDocumento, documento, direccion, telefono, ciudad, usuario, contrasena } = data

  if (!nombres || !apellidos || !tipoDocumento || !documento || !usuario || !contrasena) {
    return { 
      status: 400, 
      error: 'Campos requeridos: nombres, apellidos, tipoDocumento, documento, usuario, contrasena' 
    }
  }

  const exists = mockDatabase.personas.find(p => p.usuario === usuario || p.documento === documento)
  if (exists) {
    return {
      status: 400,
      error: 'El usuario o documento ya existe'
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
    ciudad: ciudad || '',
    usuario,
    contrasena
  }
  
  mockDatabase.personas.push(newPersona)
  saveDatabase()

  return {
    status: 201,
    data: {
      id: newPersona.id,
      nombres: newPersona.nombres,
      apellidos: newPersona.apellidos,
      tipoDocumento: newPersona.tipoDocumento,
      documento: newPersona.documento,
      usuario: newPersona.usuario
    }
  }
}
