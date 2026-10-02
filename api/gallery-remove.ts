import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from './_lib/auth.js'
import { parseBody, requirePost, requireWriteToken } from './_lib/http.js'
import { findProductTargets, getGallery, isProductId } from './_lib/product.js'
import { sanityWrite } from './_lib/sanityWrite.js'

// Se valida antes de armar el path gallery[_key=="..."], para que no se pueda inyectar nada.
const KEY_RE = /^[a-zA-Z0-9_-]+$/

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return
  if (!requireAdmin(req, res)) return
  if (!requireWriteToken(res)) return

  const body = parseBody(req.body)
  const id = body?.id
  const key = body?.key
  if (!isProductId(id) || typeof key !== 'string' || !KEY_RE.test(key)) {
    return res.status(400).json({ error: 'Body inválido: se espera { id: string, key: alfanumérico }' })
  }

  try {
    const targets = await findProductTargets(id)
    if (!targets) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    // Assets referenciados por esa foto (en el publicado o en el borrador), para borrarlos después.
    const assetIds = await sanityWrite.fetch<(string | null)[]>(
      '*[_id in $targets].gallery[][_key == $key].asset._ref',
      { targets, key },
    )

    const tx = sanityWrite.transaction()
    for (const docId of targets) {
      tx.patch(docId, (p) => p.unset([`gallery[_key=="${key}"]`]))
    }
    await tx.commit()

    // Si el asset sigue usado en otro lado (otro producto, la foto principal), Sanity rechaza
    // el borrado: se ignora y se responde igual con éxito.
    for (const assetId of new Set(assetIds.filter((a): a is string => !!a))) {
      try {
        await sanityWrite.delete(assetId)
      } catch (err) {
        console.warn(`gallery-remove: no se borró el asset ${assetId}:`, (err as Error).message)
      }
    }

    return res.status(200).json(await getGallery(id))
  } catch (err) {
    console.error('gallery-remove error:', err)
    return res.status(500).json({ error: 'Error al borrar la foto' })
  }
}
