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

// Consulta los datos del alumno dueño del token
export async function obtenerPerfil() {
    // 1. Leer el token que guardamos en el Entregable 2
    const token = localStorage.getItem('token')

    if (!token) {
        throw new Error('No hay token guardado. Inicia sesión primero.')
    }

    // 2. Pedir el perfil enviando el token en el header Authorization
    const respuesta = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })

    const datos = await respuesta.json()

    // 3. Si el token no sirve o expiró, lo borramos
    if (respuesta.status === 401) {
        localStorage.removeItem('token')
        throw new Error('Tu token no es válido o ya expiró. Vuelve a iniciar sesión.')
    }

    // 4. Cualquier otro error
    if (!respuesta.ok) {
        throw new Error(datos.error || 'No se pudo consultar el perfil')
    }

    return datos
}

// Hace una petición a la API usando el token guardado.
// La usaremos para /items en este entregable y en el siguiente.
async function peticionConToken(ruta, opciones = {}) {
    const token = localStorage.getItem('token')

    if (!token) {
        throw new Error('No hay token guardado. Inicia sesión primero.')
    }

    const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })

    // Token inválido o expirado
    if (respuesta.status === 401) {
        localStorage.removeItem('token')
        throw new Error('Tu token no es válido o ya expiró. Vuelve a iniciar sesión.')
    }

    // 204 = respuesta sin contenido (la veremos al eliminar en el Entregable 5)
    if (respuesta.status === 204) {
        return null
    }

    const datos = await respuesta.json()

    if (!respuesta.ok) {
        throw new Error(datos.error || `Error ${respuesta.status}`)
    }

    return datos
}

// Lista de items, con búsqueda y páginas de 5 en 5
export async function obtenerItems(busqueda = '', pagina = 1) {
    const parametros = new URLSearchParams({
        page: pagina,
        per_page: 5
    })

    if (busqueda) {
        parametros.append('q', busqueda)
    }

    return peticionConToken(`/items?${parametros}`)
}

// Un solo item por su id
export async function obtenerItem(id) {
    return peticionConToken(`/items/${id}`)
}