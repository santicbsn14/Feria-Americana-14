import { randomBytes } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from './_lib/auth.js'
import { parseBody, requirePost, requireWriteToken } from './_lib/http.js'
import { findProductTargets, getGallery, isProductId } from './_lib/product.js'
import { sanityWrite } from './_lib/sanityWrite.js'

const MAX_BYTES = 3 * 1024 * 1024
// Largo máximo en base64 de un archivo de MAX_BYTES (4 caracteres cada 3 bytes).
const MAX_BASE64_LENGTH = Math.ceil(MAX_BYTES / 3) * 4
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return
  if (!requireAdmin(req, res)) return
  if (!requireWriteToken(res)) return

  const body = parseBody(req.body)
  const id = body?.id
  const imageBase64 = body?.imageBase64
  if (!isProductId(id) || typeof imageBase64 !== 'string' || imageBase64 === '') {
    return res.status(400).json({ error: 'Body inválido: se espera { id: string, imageBase64: string }' })
  }
  if (imageBase64.length > MAX_BASE64_LENGTH) {
    return res.status(400).json({ error: 'La imagen supera los 3 MB' })
  }
  if (imageBase64.length % 4 !== 0 || !BASE64_RE.test(imageBase64)) {
    return res.status(400).json({ error: 'imageBase64 no es base64 válido' })
  }

  const buffer = Buffer.from(imageBase64, 'base64')
  if (buffer.length > MAX_BYTES) {
    return res.status(400).json({ error: 'La imagen supera los 3 MB' })
  }
  if (buffer.length < 3 || buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
    return res.status(400).json({ error: 'La imagen tiene que ser JPEG' })
  }

  try {
    const targets = await findProductTargets(id)
    if (!targets) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const asset = await sanityWrite.assets.upload('image', buffer, {
      contentType: 'image/jpeg',
      filename: `${id}-${Date.now()}.jpg`,
    })

    // _key obligatorio: sin él el Studio marca el array como inválido.
    const item = {
      _type: 'image',
      _key: randomBytes(6).toString('hex'),
      asset: { _type: 'reference', _ref: asset._id },
    }

    const tx = sanityWrite.transaction()
    for (const docId of targets) {
      tx.patch(docId, (p) => p.setIfMissing({ gallery: [] }).append('gallery', [item]))
    }
    await tx.commit()

    return res.status(200).json(await getGallery(id))
  } catch (err) {
    console.error('gallery-add error:', err)
    return res.status(500).json({ error: 'Error al subir la foto' })
  }
}
