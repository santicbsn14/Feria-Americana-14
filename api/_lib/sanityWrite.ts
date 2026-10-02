import { createClient } from '@sanity/client'

// Cliente con permisos de escritura. Solo se usa del lado del servidor.
export const sanityWrite = createClient({
  projectId: 'airq7lny',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
})
