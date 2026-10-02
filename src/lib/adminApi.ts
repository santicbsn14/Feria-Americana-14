import { compressImage } from './compressImage'
import type { AdminGalleryImage } from './queries'

// Llamadas a las Vercel Functions de /api. La contraseña viaja solo en el header.

export class UnauthorizedError extends Error {
  constructor() {
    super('Contraseña incorrecta o sesión vencida')
    this.name = 'UnauthorizedError'
  }
}

async function post<T>(path: string, password: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisá la conexión.')
  }

  if (res.status === 401) throw new UnauthorizedError()
  // Vercel corta antes de llegar a la función si el body supera 4,5 MB (y no responde JSON).
  if (res.status === 413) throw new Error('La foto pesa demasiado')

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = data && typeof data.error === 'string' ? data.error : `Error ${res.status}`
    throw new Error(message)
  }
  return data as T
}

export async function login(password: string): Promise<void> {
  await post<{ ok: true }>('/api/admin-login', password)
}

export function toggleAvailable(id: string, available: boolean, password: string) {
  return post<{ id: string; available: boolean }>('/api/toggle-available', password, { id, available })
}

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    // result = "data:image/jpeg;base64,<datos>": nos quedamos solo con los datos.
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(blob)
  })
}

export async function addGalleryImage(id: string, file: File, password: string) {
  const jpeg = await compressImage(file)
  if (jpeg.size > MAX_UPLOAD_BYTES) throw new Error('La foto pesa más de 3 MB aun comprimida')
  const imageBase64 = await blobToBase64(jpeg)
  return post<AdminGalleryImage[]>('/api/gallery-add', password, { id, imageBase64 })
}

export function removeGalleryImage(id: string, key: string, password: string) {
  return post<AdminGalleryImage[]>('/api/gallery-remove', password, { id, key })
}
