import { API_BASE_URL } from './config'

export async function createPetApi(mascota, token) {
    const response = await fetch(`${API_BASE_URL}/mascotas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mascota),
    })

    if (!response.ok) {
        throw new Error('Error al registrar la mascota')
    }

    return response.json()
}

export async function getPetsApi(token) {
    const response = await fetch(`${API_BASE_URL}/mascotas`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
        throw new Error('Error al obtener mascotas')
    }

    return response.json()
}