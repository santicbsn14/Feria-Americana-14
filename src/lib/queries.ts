import { sanityClient, sanityAdminClient } from './sanityClient'
import { mockProducts } from '../data/products'
import type { Product } from '../types'

const PRODUCT_FIELDS = `{
  "id": _id,
  name,
  description,
  price,
  "image": image.asset->url,
  "lqip": image.asset->metadata.lqip,
  "gallery": gallery[].asset->url,
  category,
  size,
  condition,
  available
}`

const PRODUCT_QUERY = `*[_type == "product"] | order(_createdAt desc) ${PRODUCT_FIELDS}`

const PRODUCT_BY_ID_QUERY = `*[_type == "product" && _id == $id][0] ${PRODUCT_FIELDS}`

const RELATED_QUERY = `*[_type == "product" && available == true && category == $category && _id != $excludeId]
  | order(_createdAt desc)[0...4] ${PRODUCT_FIELDS}`

export async function getProducts(): Promise<Product[]> {
  try {
    const data = await sanityClient.fetch<Product[]>(PRODUCT_QUERY)
    if (data && data.length > 0) {
      return data
    }
    return mockProducts
  } catch (error) {
    console.warn('No se pudo conectar con Sanity, usando datos mock:', error)
    return mockProducts
  }
}

// Un solo producto (detalle). Si Sanity falla o no lo encuentra, se busca en los mock.
export async function getProduct(id: string): Promise<Product | null> {
  try {
    const data = await sanityClient.fetch<Product | null>(PRODUCT_BY_ID_QUERY, { id })
    if (data) return data
  } catch (error) {
    console.warn('No se pudo conectar con Sanity, buscando en los datos mock:', error)
  }
  return mockProducts.find((p) => p.id === id) ?? null
}

// Hasta 4 disponibles de la misma categoría, sin el actual. Si falla, sin relacionados (no usa mock).
export async function getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  try {
    const data = await sanityClient.fetch<Product[]>(RELATED_QUERY, { category, excludeId })
    return data ?? []
  } catch (error) {
    console.warn('No se pudieron cargar los productos relacionados:', error)
    return []
  }
}

// url es null si el ítem de la galería quedó sin imagen cargada en el Studio.
export interface AdminGalleryImage {
  key: string
  url: string | null
}

export type AdminProduct = Pick<Product, 'id' | 'name' | 'price' | 'image' | 'category' | 'available'> & {
  gallery: AdminGalleryImage[] | null
}

const ADMIN_PRODUCT_QUERY = `*[_type == "product"] | order(_createdAt desc) {
  "id": _id,
  name,
  price,
  "image": image.asset->url,
  "gallery": gallery[]{ "key": _key, "url": asset->url },
  category,
  available
}`

// A diferencia de getProducts(), no cae a los datos mock: si falla, lanza el error.
export async function getAdminProducts(): Promise<AdminProduct[]> {
  return sanityAdminClient.fetch<AdminProduct[]>(ADMIN_PRODUCT_QUERY)
}
