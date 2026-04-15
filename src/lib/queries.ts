import { sanityClient } from './sanityClient'
import { mockProducts } from '../data/products'
import type { Product } from '../types'

const PRODUCT_QUERY = `*[_type == "product"] | order(_createdAt desc) {
  "id": _id,
  name,
  description,
  price,
  "image": image.asset->url,
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
    console.log(data)
    // Si no hay productos en Sanity, usa los mocks
    return mockProducts
  } catch (error) {
    console.warn('No se pudo conectar con Sanity, usando datos mock:', error)
    return mockProducts
  }
}