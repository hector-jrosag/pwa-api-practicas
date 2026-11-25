// Dirección base de la API de prácticas
const API_URL = 'https://rubrika.mx/api/v1'

// Envía correo y licencia, y regresa la respuesta de la API
export async function obtenerToken(correo, licencia) {
    const respuesta = await fetch(`${API_URL}/auth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            email: correo,
            license_key: licencia
        })
    })

    const datos = await respuesta.json()

    // Si la API responde con error (401, 422, etc.), avisamos
    if (!respuesta.ok) {
        throw new Error(datos.error || 'No se pudo obtener el token')
    }

    return datos
}