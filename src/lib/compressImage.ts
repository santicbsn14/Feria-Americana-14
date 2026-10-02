// Compresión en el navegador, sin librerías: lado más largo a 1600px como máximo y JPEG ~0.82.

const MAX_SIDE = 1600
const QUALITY = 0.82

export class UnsupportedImageError extends Error {
  constructor() {
    super('Formato de imagen no soportado')
    this.name = 'UnsupportedImageError'
  }
}

// Se decodifica con <img> porque los navegadores actuales aplican la orientación EXIF al
// decodificarla (image-orientation: from-image por defecto) y también al dibujarla en el canvas,
// y naturalWidth/naturalHeight ya vienen rotados. Así las fotos del celular no quedan giradas.
export async function compressImage(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    try {
      await img.decode()
    } catch {
      // Ej. HEIC en Android: el navegador no lo puede decodificar.
      throw new UnsupportedImageError()
    }

    const { naturalWidth: w, naturalHeight: h } = img
    if (!w || !h) throw new UnsupportedImageError()

    const scale = Math.min(1, MAX_SIDE / Math.max(w, h)) // nunca agrandar
    const width = Math.round(w * scale)
    const height = Math.round(h * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No se pudo procesar la imagen')

    // Fondo blanco: un PNG con transparencia quedaría negro al pasar a JPEG.
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
    if (!blob) throw new Error('No se pudo procesar la imagen')
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}
