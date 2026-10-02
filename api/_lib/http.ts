import type { VercelRequest, VercelResponse } from '@vercel/node'

// Si el método no es POST, responde 405 y devuelve false.
export function requirePost(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'POST') return true
  res.setHeader('Allow', 'POST')
  res.status(405).json({ error: 'Método no permitido' })
  return false
}

// Si falta el token de escritura, responde 500 y devuelve false.
export function requireWriteToken(res: VercelResponse): boolean {
  if (process.env.SANITY_WRITE_TOKEN) return true
  res.status(500).json({ error: 'SANITY_WRITE_TOKEN no configurado en el servidor' })
  return false
}

// Acepta el body ya parseado o como string (si llega sin Content-Type: application/json).
export function parseBody(body: unknown): Record<string, unknown> | null {
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return null
    }
  }
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : null
}
