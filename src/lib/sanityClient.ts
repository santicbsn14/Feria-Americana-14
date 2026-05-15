import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'ybsbntnx',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

export function imgUrl(url: string, width: number = 800): string {
  if (!url) return ''
  return `${url}?auto=format&q=80&w=${width}&fit=max`
}