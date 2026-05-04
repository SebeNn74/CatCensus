import { API_BASE_URL } from './config'

export async function loginApi(usuario, contrasena) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena }),
    })

    if (!response.ok) {
        throw new Error('Credenciales incorrectas')
    }

    return response.json()
}