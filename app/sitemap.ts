import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const lastModified = new Date()

  const routes = ['/', '/pricing', '/login', '/signup']
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
  }))
}
