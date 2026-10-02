import { sanityClient, sanityAdminClient } from './sanityClient'
import { mockProducts } from '../data/products'
import type { Product } from '../types'

const PRODUCT_QUERY = `*[_type == "product"] | order(_createdAt desc) {
  "id": _id,
  name,
  description,
  price,
  "image": image.asset->url,
  "gallery": gallery[].asset->url,
  category,
  size,
  condition,
  available
}`

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
