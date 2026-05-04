import { API_BASE_URL } from './config'

export async function createPersonApi(persona, token) {
    const response = await fetch(`${API_BASE_URL}/personas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(persona),
    })

    if (!response.ok) {
        throw new Error('Error al registrar la persona')
    }

    return response.json()
}

export async function getPeopleApi(token) {
    const response = await fetch(`${API_BASE_URL}/personas`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
        throw new Error('Error al obtener personas')
    }

    return response.json()
}