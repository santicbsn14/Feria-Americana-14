import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from './_lib/auth.js'
import { parseBody, requirePost, requireWriteToken } from './_lib/http.js'
import { findProductTargets, isProductId } from './_lib/product.js'
import { sanityWrite } from './_lib/sanityWrite.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return
  if (!requireAdmin(req, res)) return
  if (!requireWriteToken(res)) return

  const body = parseBody(req.body)
  const id = body?.id
  const available = body?.available
  if (!isProductId(id) || typeof available !== 'boolean') {
    return res.status(400).json({ error: 'Body inválido: se espera { id: string, available: boolean }' })
  }

  try {
    const targets = await findProductTargets(id)
    if (!targets) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const tx = sanityWrite.transaction()
    for (const docId of targets) {
      tx.patch(docId, (p) => p.set({ available }))
    }
    await tx.commit()

    return res.status(200).json({ id, available })
  } catch (err) {
    console.error('toggle-available error:', err)
    return res.status(500).json({ error: 'Error al actualizar el producto' })
  }
}
