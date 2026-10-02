import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'airq7lny',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})
export function imgUrl(url: string, width: number = 800): string {
  if (!url) return ''
  return `${url}?auto=format&q=80&w=${width}&fit=max`
}
// Cliente de lectura para el panel admin: sin CDN para ver los cambios al instante. Sin token.
export const sanityAdminClient = createClient({
  projectId: 'airq7lny',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})
