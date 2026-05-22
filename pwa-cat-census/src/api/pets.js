import { API_BASE_URL } from './config'

export async function createPetApi(mascota, token) {
    console.log("🐾 createPetApi invocado para:", mascota.nombre);
    const { id, _id, _rev, syncStatus, createdAt, updatedAt, ...cleanMascota } = mascota;
    const response = await fetch(`${API_BASE_URL}/mascotas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanMascota),
    })

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'No text');
        throw new Error(`Error al registrar la mascota: ${errorText}`)
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