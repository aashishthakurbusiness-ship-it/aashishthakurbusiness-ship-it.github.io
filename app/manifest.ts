import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aashish Thakur - Portfolio',
    short_name: 'Aashish Thakur',
    description: 'Portfolio of Aashish Thakur - Director & VFX Artist',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
