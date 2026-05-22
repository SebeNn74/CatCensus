import { API_BASE_URL, ID_PROYECT, COLOR_PROYECT } from './config'

export async function createCensusApi(censo, token) {
    const { id, _id, _rev, syncStatus, createdAt, updatedAt, ...cleanCenso } = censo;
    const payload = {
        ...cleanCenso,
        idProyecto: ID_PROYECT,
        color: COLOR_PROYECT,
    }

    const response = await fetch(`${API_BASE_URL}/censos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'No text');
        throw new Error(`Error al registrar el censo: ${errorText}`)
    }

    return response.json()
}

export async function getCensusApi() {
    const response = await fetch(`${API_BASE_URL}/censos`)

    if (!response.ok) {
        throw new Error('Error al obtener censos')
    }

    return response.json()
}