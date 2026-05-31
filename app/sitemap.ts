import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://aashishthakur7.com.np',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
  ]
}
