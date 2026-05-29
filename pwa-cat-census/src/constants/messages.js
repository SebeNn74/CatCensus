export const PUSH_ERRORS = {
    NOT_SUPPORTED: "Las notificaciones push no son compatibles con este navegador.",
    PERMISSION_DENIED: "Permiso denegado para recibir notificaciones push.",
    VAPID_KEY_FAILED: (status, text) => `Error al obtener la clave VAPID (status: ${status}): ${text}`,
    PUBLIC_KEY_MISSING: "La respuesta no contiene la clave pública VAPID.",
    SUBSCRIPTION_FAILED: (status, text) => `Error al registrar la suscripción push (status: ${status}): ${text}`,
    NO_TOKEN: "No se proporcionó un token de autenticación para la suscripción push.",
}