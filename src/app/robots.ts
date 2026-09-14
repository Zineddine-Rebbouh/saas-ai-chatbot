import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/portal/'],
      },
    ],
    sitemap: 'https://domainly.ai/sitemap.xml',
    host: 'https://domainly.ai',
  }
}
