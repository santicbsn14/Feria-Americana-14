import { timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Valida el header x-admin-password. Si falla, ya responde (401/500) y devuelve false.
export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    res.status(500).json({ error: 'ADMIN_PASSWORD no configurada en el servidor' })
    return false
  }

  const header = req.headers['x-admin-password']
  const provided = Array.isArray(header) ? header[0] : header
  if (typeof provided !== 'string' || !safeEqual(provided, expected)) {
    res.status(401).json({ error: 'No autorizado' })
    return false
  }
  return true
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  // timingSafeEqual tira error con largos distintos: comparamos igual contra sí mismo
  // para no cortar antes y no filtrar el largo por tiempo de respuesta.
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufB, bufB)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}
