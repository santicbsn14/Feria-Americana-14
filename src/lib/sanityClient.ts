import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'airq7lny',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})
export function imgUrl(url: string, width: number = 800): string {
  if (!url) return ''
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}auto=format&q=80&w=${width}&fit=max`
}
// Recorte exacto (cards 4:5). Los mock de Unsplash ya traen query string.
export function imgCrop(url: string, width: number, height: number): string {
  if (!url) return ''
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}auto=format&q=80&w=${width}&h=${height}&fit=crop`
}
// Cliente de lectura para el panel admin: sin CDN para ver los cambios al instante. Sin token.
export const sanityAdminClient = createClient({
  projectId: 'airq7lny',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})
