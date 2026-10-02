import { sanityWrite } from './sanityWrite.js'

export interface GalleryItem {
  key: string
  url: string | null
}

// Ids que acepta la API: el id publicado, nunca el del borrador.
export function isProductId(id: unknown): id is string {
  return typeof id === 'string' && id.trim() !== '' && !id.startsWith('drafts.')
}

/**
 * Busca el producto publicado y su borrador.
 * Devuelve null si no existe el publicado (o no es un "product").
 * Si existe, devuelve los ids a patchear: el publicado y, si hay, `drafts.<id>`
 * (así un publish posterior desde el Studio no pisa el cambio).
 */
export async function findProductTargets(id: string): Promise<string[] | null> {
  const draftId = `drafts.${id}`
  const docs = await sanityWrite.fetch<{ _id: string }[]>(
    '*[_id in [$id, $draftId] && _type == "product"]{ _id }',
    { id, draftId },
  )
  if (!docs.some((d) => d._id === id)) return null
  return docs.some((d) => d._id === draftId) ? [id, draftId] : [id]
}

// Galería del documento publicado, en el formato que consume el panel.
export async function getGallery(id: string): Promise<GalleryItem[]> {
  const gallery = await sanityWrite.fetch<GalleryItem[] | null>(
    '*[_id == $id][0].gallery[]{ "key": _key, "url": asset->url }',
    { id },
  )
  return gallery ?? []
}
