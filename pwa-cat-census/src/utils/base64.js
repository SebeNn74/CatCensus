// Convierte imagen a Base64 y valida que no supere 50kb
export function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
            const base64 = reader.result
            // Calculamos el tamaño real del string base64 en bytes
            const sizeInBytes = (base64.length * 3) / 4
            const sizeInKb = sizeInBytes / 1024

            if (sizeInKb > 50) {
                reject(new Error(`La imagen pesa ${sizeInKb.toFixed(1)}kb. Máximo permitido: 50kb`))
            } else {
                resolve(base64)
            }
        }

        reader.onerror = () => reject(new Error('Error al leer el archivo'))
        reader.readAsDataURL(file)
    })
}