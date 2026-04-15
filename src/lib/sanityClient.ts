import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: 'airq7lny',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})